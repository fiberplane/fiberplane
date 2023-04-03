use anyhow::{anyhow, Context, Result};
use convert_case::{Case, Casing};
use okapi::openapi3::Server;
use std::fs::{File, OpenOptions};
use std::io::{BufWriter, Write};
use std::path::Path;

pub(crate) fn generate_client_configs(servers: &[Server], src_path: &Path) -> Result<()> {
    // https://stackoverflow.com/a/50691004/11494565
    let file = OpenOptions::new()
        .write(true)
        .create(true)
        .append(false)
        .open(src_path.join("clients.rs"))
        .context("Failed to open or create clients.rs file")?;

    let mut writer = BufWriter::new(file);

    writeln!(writer, "use anyhow::{{Context as _, Result}};")?;
    writeln!(
        writer,
        "use reqwest::{{Client, header, Method, RequestBuilder, Url}};"
    )?;
    writeln!(writer, "use crate::builder::ApiClientBuilder;")?;
    writeln!(writer, "use std::time::Duration;\n")?;

    generate_config_method(&mut writer)?;

    for server in servers {
        generate_client_method(server, &mut writer)?;
    }

    generate_client_type(&mut writer)?;

    writer
        .flush()
        .context("Failed to flush output for `clients.rs`")?;

    // https://stackoverflow.com/a/50691004/11494565
    let file = OpenOptions::new()
        .write(true)
        .create(true)
        .append(false)
        .open(src_path.join("builder.rs"))
        .context("Failed to open or create builder.rs file")?;

    let mut writer = BufWriter::new(file);

    generate_builder(&mut writer)?;

    writer
        .flush()
        .context("Failed to flush output for `builder.rs`")
}

fn generate_config_method(writer: &mut BufWriter<File>) -> Result<()> {
    writeln!(writer, "pub fn default_config(")?;
    writeln!(writer, "    timeout: Option<Duration>,")?;
    writeln!(writer, "    user_agent: Option<&str>,")?;
    writeln!(writer, "    default_headers: Option<header::HeaderMap>,")?;
    writeln!(writer, ") -> Result<Client> {{")?;

    writeln!(
        writer,
        "    let mut headers = default_headers.unwrap_or_default();"
    )?;
    writeln!(writer, "    headers.insert(header::USER_AGENT, header::HeaderValue::from_str(user_agent.unwrap_or(\"Fiberplane Rust API client\"))?);\n")?;

    writeln!(writer, "    Ok(Client::builder()")?;
    writeln!(
        writer,
        "        .connect_timeout(timeout.unwrap_or_else(|| Duration::from_secs(10)))"
    )?;
    writeln!(writer, "        .default_headers(headers)")?;
    writeln!(writer, "        .build()?)")?;

    writeln!(writer, "}}\n")?;

    Ok(())
}

fn generate_client_method(server: &Server, writer: &mut BufWriter<File>) -> Result<()> {
    let description = server
        .description
        .as_ref()
        .ok_or_else(|| anyhow!("Server {:?} does not have `description`", server))?;
    let description = description.replacen("servers", "", 1);

    write!(
        writer,
        "pub fn {}_client(",
        description.to_case(Case::Snake)
    )?;

    let mut peekable = server.variables.iter().peekable();

    while let Some((name, _)) = peekable.next() {
        write!(writer, "\n    {}: Option<&str>,", name.to_case(Case::Snake))?;

        if peekable.peek().is_none() {
            writeln!(writer)?;
        }
    }

    writeln!(writer, ") -> Result<ApiClient> {{")?;

    let variables: Vec<String> = server
        .variables
        .iter()
        .map(|(name, server)| {
            let snake_name = name.to_case(Case::Snake);
            let default = &server.default;
            format!("let {snake_name} = {snake_name}.unwrap_or(\"{default}\");")
        })
        .collect();

    let variables = variables.join("\n    ");

    if !server.variables.is_empty() {
        writeln!(writer, "    {variables}")?;

        let format_args: Vec<String> = server
            .variables
            .keys()
            .map(|name| {
                let snake_name = name.to_case(Case::Snake);
                format!("{snake_name} = {snake_name}")
            })
            .collect();

        write!(
            writer,
            "    let url = &format!(\"{}\", {});",
            server.url,
            format_args.join(", ")
        )?;
    } else {
        write!(writer, "    let url = \"{}\";", server.url)?;
    }

    writeln!(writer, "\n")?;

    writeln!(writer, "    let config = default_config(")?;
    writeln!(writer, "        Some(Duration::from_secs(30)),")?;
    writeln!(writer, "        None,")?;
    writeln!(writer, "        None,")?;
    writeln!(writer, "    )?;\n")?;

    writeln!(writer, "    Ok(ApiClient {{")?;
    writeln!(writer, "        client: config,")?;
    writeln!(writer, "        server: Url::parse(url).context(\"Failed to parse base url from Open API document\")?,")?;
    writeln!(writer, "    }})")?;

    writeln!(writer, "}}\n")?;

    Ok(())
}

fn generate_client_type(writer: &mut BufWriter<File>) -> Result<()> {
    writeln!(writer, "#[derive(Debug)]")?;
    writeln!(writer, "pub struct ApiClient {{")?;
    writeln!(writer, "    pub client: Client,")?;
    writeln!(writer, "    pub server: Url,")?;
    writeln!(writer, "}}\n")?;

    writeln!(writer, "impl ApiClient {{")?;

    writeln!(
        writer,
        "    pub fn request(&self, method: Method, endpoint: &str) -> Result<RequestBuilder> {{"
    )?;
    writeln!(writer, "        let url = self.server.join(endpoint)?;\n")?;

    writeln!(writer, "        Ok(self.client.request(method, url))")?;
    writeln!(writer, "    }}\n")?;

    writeln!(
        writer,
        "    pub fn builder(base_url: Url) -> ApiClientBuilder {{"
    )?;
    writeln!(writer, "        ApiClientBuilder::new(base_url)")?;
    writeln!(writer, "    }}")?;

    writeln!(writer, "}}")?;

    Ok(())
}

fn generate_builder(writer: &mut BufWriter<File>) -> Result<()> {
    writeln!(writer, "use crate::clients::ApiClient;")?;
    writeln!(writer, "use anyhow::Result;")?;
    writeln!(writer, "use reqwest::{{header, Url}};")?;
    writeln!(writer, "use std::time::Duration;\n")?;

    writeln!(writer, "#[derive(Debug)]")?;
    writeln!(writer, "pub struct ApiClientBuilder {{")?;
    writeln!(writer, "    // Some client specific values")?;
    writeln!(writer, "    base_url: Url,")?;
    writeln!(writer, "    timeout: Option<Duration>,\n")?;

    writeln!(
        writer,
        "    // These values will be mapped to header values"
    )?;
    writeln!(writer, "    user_agent: Option<String>,")?;
    writeln!(writer, "    bearer_token: Option<String>,")?;
    writeln!(writer, "}}\n")?;

    writeln!(writer, "impl ApiClientBuilder {{")?;
    writeln!(writer, "    pub fn new(base_url: Url) -> Self {{")?;
    writeln!(writer, "        Self {{")?;
    writeln!(writer, "            base_url,")?;
    writeln!(writer, "            timeout: None,")?;
    writeln!(writer, "            user_agent: None,")?;
    writeln!(writer, "            bearer_token: None,")?;
    writeln!(writer, "        }}")?;
    writeln!(writer, "    }}\n")?;

    writeln!(writer, "    /// Override the base_url for the ApiClient.")?;
    writeln!(
        writer,
        "    pub fn base_url(mut self, base_url: Url) -> Self {{"
    )?;
    writeln!(writer, "        self.base_url = base_url;")?;
    writeln!(writer, "        self")?;
    writeln!(writer, "    }}\n")?;

    writeln!(writer, "    /// Change the timeout for the ApiClient.")?;
    writeln!(
        writer,
        "    pub fn timeout(mut self, timeout: Option<Duration>) -> Self {{"
    )?;
    writeln!(writer, "        self.timeout = timeout;")?;
    writeln!(writer, "        self")?;
    writeln!(writer, "    }}\n")?;

    writeln!(writer, "    /// Override the user agent for the ApiClient.")?;
    writeln!(
        writer,
        "    pub fn user_agent(mut self, user_agent: Option<impl Into<String>>) -> Self {{"
    )?;
    writeln!(
        writer,
        "        self.user_agent = user_agent.map(|agent| agent.into());"
    )?;
    writeln!(writer, "        self")?;
    writeln!(writer, "    }}\n")?;

    writeln!(
        writer,
        "    /// Set an authentication token for the ApiClient."
    )?;
    writeln!(
        writer,
        "    pub fn bearer_token(mut self, bearer_token: Option<impl Into<String>>) -> Self {{"
    )?;
    writeln!(
        writer,
        "        self.bearer_token = bearer_token.map(|token| token.into());"
    )?;
    writeln!(writer, "        self")?;
    writeln!(writer, "    }}\n")?;

    writeln!(
        writer,
        "    pub fn build_client(&self) -> Result<reqwest::Client> {{"
    )?;
    writeln!(
        writer,
        "        let mut headers = header::HeaderMap::new();\n"
    )?;

    writeln!(writer, "        headers.insert(")?;
    writeln!(writer, "            header::USER_AGENT,")?;
    writeln!(writer, "            header::HeaderValue::from_str(")?;
    writeln!(writer, "                self.user_agent")?;
    writeln!(writer, "                    .as_deref()")?;
    writeln!(
        writer,
        "                    .unwrap_or(\"Fiberplane Rust API client\"),"
    )?;
    writeln!(writer, "            )?,")?;
    writeln!(writer, "        );\n")?;

    writeln!(
        writer,
        "        if let Some(bearer) = &self.bearer_token {{"
    )?;
    writeln!(writer, "          headers.insert(")?;
    writeln!(writer, "              header::AUTHORIZATION,")?;
    writeln!(writer, "              header::HeaderValue::from_str(")?;
    writeln!(
        writer,
        "                  &format!(\"Bearer {{}}\", bearer)"
    )?;
    writeln!(writer, "              )?,")?;
    writeln!(writer, "          );")?;
    writeln!(writer, "        }}\n")?;

    writeln!(writer, "        let client = reqwest::Client::builder()")?;
    writeln!(
        writer,
        "            .connect_timeout(self.timeout.unwrap_or_else(|| Duration::from_secs(5)))"
    )?;
    writeln!(writer, "            .default_headers(headers)")?;
    writeln!(writer, "            .build()?;\n")?;

    writeln!(writer, "        Ok(client)")?;
    writeln!(writer, "    }}\n")?;

    writeln!(writer, "    /// Build the ApiClient.")?;
    writeln!(writer, "    pub fn build(self) -> Result<ApiClient> {{")?;
    writeln!(writer, "        let client = self.build_client()?;")?;
    writeln!(writer, "        let server = self.base_url;")?;
    writeln!(writer, "        Ok(ApiClient {{ client, server }})")?;
    writeln!(writer, "    }}")?;
    writeln!(writer, "}}")?;

    Ok(())
}
