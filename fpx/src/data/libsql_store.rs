use crate::api::models::settings::Settings;
use crate::data::models::{HexEncodedId, Span};
use crate::data::sql::SqlBuilder;
use crate::data::{DbError, Result, Store, Transaction};
use anyhow::Context;
use async_trait::async_trait;
use libsql::{de, Rows};
use libsql::{params, Builder, Connection};
use serde::de::DeserializeOwned;
use serde_json::Map;
use std::fmt::Display;
use std::path::Path;
use std::sync::Arc;
use tracing::{error, trace};

pub mod migrations;
#[cfg(test)]
mod tests;

pub enum DataPath<'a> {
    InMemory,
    File(&'a Path),
}

impl<'a> DataPath<'a> {
    pub fn as_path(&self) -> &'a Path {
        match self {
            DataPath::InMemory => Path::new(":memory:"),
            DataPath::File(path) => path,
        }
    }
}

impl<'a> Display for DataPath<'a> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DataPath::InMemory => write!(f, ":memory:"),
            DataPath::File(path) => f.write_fmt(format_args!("{}", path.display())),
        }
    }
}

#[derive(Clone)]
pub struct LibsqlStore {
    connection: Connection,
    sql_builder: Arc<SqlBuilder>,
}

impl LibsqlStore {
    pub async fn open(path: DataPath<'_>) -> Result<Self, anyhow::Error> {
        trace!(%path, "Opening Libsql database");

        // Not sure if we need this database object, but for now we just drop
        // it.
        let database = Builder::new_local(path.as_path())
            .build()
            .await
            .context("failed to build libSQL database object")?;

        let mut connection = database
            .connect()
            .context("failed to connect to libSQL database")?;

        Self::initialize_connection(&mut connection).await?;

        let sql_builder = Arc::new(SqlBuilder::new());

        Ok(LibsqlStore {
            connection,
            sql_builder,
        })
    }

    pub async fn in_memory() -> Result<Self, anyhow::Error> {
        Self::open(DataPath::InMemory).await
    }

    pub async fn file(db_path: &Path) -> Result<Self, anyhow::Error> {
        Self::open(DataPath::File(db_path)).await
    }

    /// This function will execute a few PRAGMA statements to set the database
    /// connection. This should run before any other queries are executed.
    async fn initialize_connection(connection: &mut Connection) -> Result<()> {
        connection
            .query(
                "PRAGMA journal_mode = WAL;
                PRAGMA busy_timeout = 5000;
                PRAGMA cache_size = 2000;
                PRAGMA foreign_keys = ON;
                PRAGMA journal_size_limit = 27103364;
                PRAGMA mmap_size = 134217728;
                PRAGMA synchronous = NORMAL;
                PRAGMA temp_store = memory;",
                (),
            )
            .await
            .map_err(|err| DbError::InternalError(err.to_string()))?;

        Ok(())
    }
}

#[async_trait]
impl Store for LibsqlStore {
    async fn start_readonly_transaction(&self) -> Result<Transaction> {
        Ok(Transaction {})
    }
    async fn start_readwrite_transaction(&self) -> Result<Transaction> {
        Ok(Transaction {})
    }

    async fn commit_transaction(&self, _tx: Transaction) -> Result<(), DbError> {
        Ok(())
    }
    async fn rollback_transaction(&self, _tx: Transaction) -> Result<(), DbError> {
        Ok(())
    }

    async fn span_get(
        &self,
        _tx: &Transaction,
        trace_id: &HexEncodedId,
        span_id: &HexEncodedId,
    ) -> Result<Span> {
        let span = self
            .connection
            .query(&self.sql_builder.span_get(), (trace_id, span_id))
            .await?
            .fetch_one()
            .await?;

        Ok(span)
    }

    async fn span_list_by_trace(
        &self,
        _tx: &Transaction,
        trace_id: &HexEncodedId,
    ) -> Result<Vec<Span>> {
        let spans = self
            .connection
            .query(&self.sql_builder.span_list_by_trace(), params!(trace_id))
            .await?
            .fetch_all()
            .await?;

        Ok(spans)
    }

    async fn span_create(&self, _tx: &Transaction, span: Span) -> Result<Span> {
        let span = self
            .connection
            .query(
                &self.sql_builder.span_create(),
                params!(
                    span.trace_id,
                    span.span_id,
                    span.parent_span_id,
                    span.name,
                    span.kind,
                    span.start_time,
                    span.end_time,
                    span.inner,
                ),
            )
            .await?
            .fetch_one()
            .await?;

        Ok(span)
    }

    /// Get a list of all the traces. (currently limited to 20, sorted by most
    /// recent [`end_time`])
    ///
    /// Note that a trace is a computed value, so not all properties are
    /// present. To get all the data, use the [`Self::span_list_by_trace`] fn.
    async fn traces_list(
        &self,
        _tx: &Transaction,
        // Future improvement could hold sort fields, limits, etc
    ) -> Result<Vec<crate::data::models::Trace>> {
        let traces = self
            .connection
            .query(&self.sql_builder.traces_list(None), ())
            .await?
            .fetch_all()
            .await?;

        Ok(traces)
    }

    /// Delete all spans with a specific trace_id.
    async fn span_delete_by_trace(
        &self,
        _tx: &Transaction,
        trace_id: &HexEncodedId,
    ) -> Result<Option<u64>> {
        let rows_affected = self
            .connection
            .execute(&self.sql_builder.span_delete_by_trace(), params!(trace_id))
            .await?;

        Ok(Some(rows_affected))
    }

    /// Delete a single span.
    async fn span_delete(
        &self,
        _tx: &Transaction,
        trace_id: &HexEncodedId,
        span_id: &HexEncodedId,
    ) -> Result<Option<u64>> {
        let rows_affected = self
            .connection
            .execute(&self.sql_builder.span_delete(), params!(trace_id, span_id))
            .await?;

        Ok(Some(rows_affected))
    }

    async fn settings_upsert(&self, _tx: &Transaction, settings: Settings) -> Result<Settings> {
        let mut result: Map<String, serde_json::Value> = Map::new();

        for (key, value) in settings.into_map()? {
            let value = serde_json::to_string(&value).map_err(|_| DbError::FailedSerialize)?;

            let inserted_value: String = self
                .connection
                .query(
                    &self.sql_builder.settings_insert(),
                    params!(key.clone(), value),
                )
                .await?
                .fetch_one()
                .await?;

            result.insert(
                key,
                serde_json::from_str(&inserted_value).map_err(|err| {
                    error!(?err, "failed to serialize from upserted db value");
                    DbError::FailedSerialize
                })?,
            );
        }

        serde_json::from_value(serde_json::Value::Object(result)).map_err(|err| {
            error!(
                ?err,
                "failed to serialize from upserted db value collection"
            );
            DbError::FailedSerialize
        })
    }

    async fn settings_get(&self, _tx: &Transaction) -> Result<Settings> {
        let settings: Vec<(String, String)> = self
            .connection
            .query(&self.sql_builder.settings_get(), ())
            .await?
            .fetch_all()
            .await?;

        let result: Map<String, serde_json::Value> = settings
            .into_iter()
            .map(|(key, value)| {
                (
                    key,
                    serde_json::from_str(&value).expect("db should not contain invalid data"),
                )
            }) // we need better error handling at some point here
            .collect();

        serde_json::from_value(serde_json::Value::Object(result)).map_err(|err| {
            error!(?err, "failed to serialize from db values");
            DbError::FailedSerialize
        })
    }
}

#[allow(dead_code)]
pub(crate) trait RowsExt {
    /// `T` must be a `struct`
    async fn fetch_one<T: DeserializeOwned>(&mut self) -> Result<T>;

    /// `T` must be a `struct`
    async fn fetch_optional<T: DeserializeOwned>(&mut self) -> Result<Option<T>>;

    /// `T` must be a `struct`
    async fn fetch_all<T: DeserializeOwned>(&mut self) -> Result<Vec<T>>;
}

impl RowsExt for Rows {
    async fn fetch_one<T: DeserializeOwned>(&mut self) -> Result<T> {
        self.fetch_optional().await?.ok_or(DbError::NotFound)
    }

    async fn fetch_optional<T: DeserializeOwned>(&mut self) -> Result<Option<T>> {
        match self.next().await? {
            Some(row) => Ok(Some(de::from_row(&row)?)),
            None => Ok(None),
        }
    }

    async fn fetch_all<T: DeserializeOwned>(&mut self) -> Result<Vec<T>> {
        let mut results = Vec::new();

        while let Some(row) = self.next().await? {
            results.push(de::from_row(&row)?);
        }

        Ok(results)
    }
}
