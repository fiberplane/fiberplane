use crate::comments::{Thread, ThreadItem, UserSummary};
use crate::events::Event;
use crate::labels::LabelValidationError;
use crate::notebooks::operations::Operation;
use crate::timestamps::Timestamp;
use base64uuid::Base64Uuid;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use std::cmp::Ordering;
use std::fmt::Debug;
use typed_builder::TypedBuilder;

/// Real-time message sent by the client over a WebSocket connection.
#[derive(Clone, Debug, Deserialize, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ClientRealtimeMessage {
    /// Authenticate this client
    Authenticate(AuthenticateMessage),

    /// Subscribe to changes from a specific Notebook.
    Subscribe(SubscribeMessage),

    /// Unsubscribe to changes from a specific Notebook.
    Unsubscribe(UnsubscribeMessage),

    /// Apply an operation to a specific Notebook.
    ApplyOperation(Box<ApplyOperationMessage>),

    /// Apply multiple operations to a specific Notebook.
    ApplyOperationBatch(Box<ApplyOperationBatchMessage>),

    /// Request a DebugResponse from the server.
    DebugRequest(DebugRequestMessage),

    FocusInfo(FocusInfoMessage),

    /// User started typing a comment.
    UserTypingComment(UserTypingCommentClientMessage),

    /// Subscribe to workspace activities
    SubscribeWorkspace(SubscribeWorkspaceMessage),

    /// Unsubscribe from workspace activities
    UnsubscribeWorkspace(UnsubscribeWorkspaceMessage),
}

impl ClientRealtimeMessage {
    pub fn op_id(&self) -> &Option<String> {
        use ClientRealtimeMessage::*;
        match self {
            Authenticate(msg) => &msg.op_id,
            Subscribe(msg) => &msg.op_id,
            Unsubscribe(msg) => &msg.op_id,
            ApplyOperation(msg) => &msg.op_id,
            ApplyOperationBatch(msg) => &msg.op_id,
            DebugRequest(msg) => &msg.op_id,
            FocusInfo(msg) => &msg.op_id,
            UserTypingComment(msg) => &msg.op_id,
            SubscribeWorkspace(msg) => &msg.op_id,
            UnsubscribeWorkspace(msg) => &msg.op_id,
        }
    }
}

/// Real-time message sent by the server over a WebSocket connection.
#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum ServerRealtimeMessage {
    /// Apply an operation to a specific Notebook.
    ApplyOperation(Box<ApplyOperationMessage>),

    /// An Ack message will be sent once an operation is received and processed.
    /// No Ack message will sent if the op_id of the original message was empty.
    Ack(AckMessage),

    /// An Err message will be sent once an operation is received, but could not
    /// be processed. It includes the op_id if that was present.
    Err(ErrMessage),

    /// Response from a DebugRequest. Contains some useful data regarding the
    /// connection.
    DebugResponse(DebugResponseMessage),

    /// New event was added to the workspace
    EventAdded(EventAddedMessage),

    /// Event was updated in the workspace
    EventUpdated(EventUpdatedMessage),

    /// Event was deleted from the workspace
    EventDeleted(EventDeletedMessage),

    /// Notifies a mentioned user of the fact they've been mentioned by someone
    /// else.
    Mention(MentionMessage),

    /// An apply operation got rejected by the server, see message for the
    /// reason.
    Rejected(RejectedMessage),

    /// A user has joined as a subscriber to a notebook.
    SubscriberAdded(SubscriberAddedMessage),

    /// A previously subscribed user has left a notebook.
    SubscriberRemoved(SubscriberRemovedMessage),

    SubscriberChangedFocus(SubscriberChangedFocusMessage),

    /// A new comment thread was added to the notebook.
    ThreadAdded(ThreadAddedMessage),

    /// A new item was added to a comment thread (e.g. a comment or a thread status change).
    ThreadItemAdded(ThreadItemAddedMessage),

    /// A new item was added to a comment thread (e.g. a comment or a thread status change).
    ThreadItemUpdated(ThreadItemUpdatedMessage),

    /// A comment thread was deleted
    ThreadDeleted(ThreadDeletedMessage),

    /// A user started typing a comment
    UserTypingComment(UserTypingCommentServerMessage),
}

#[derive(Clone, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct AuthenticateMessage {
    /// Bearer token.
    #[builder(setter(into))]
    pub token: String,

    /// Operation ID.
    ///
    /// Only messages with an operation ID will receive an `Ack` from the
    /// server.
    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub op_id: Option<String>,
}

impl Debug for AuthenticateMessage {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("AuthenticateMessage")
            .field("token", &"[REDACTED]")
            .field("op_id", &self.op_id)
            .finish()
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct SubscribeMessage {
    /// ID of the notebook.
    #[builder(setter(into))]
    pub notebook_id: String,

    /// The current revision that the client knows about. If this is not the
    /// current revision according to the server, than the server will sent
    /// all operations starting from this revision.
    #[builder(default, setter(into, strip_option))]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub revision: Option<u32>,

    /// Operation ID.
    ///
    /// Only messages with an operation ID will receive an `Ack` from the
    /// server.
    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub op_id: Option<String>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct UnsubscribeMessage {
    /// ID of the notebook.
    #[builder(setter(into))]
    pub notebook_id: String,

    /// Operation ID.
    ///
    /// Only messages with an operation ID will receive an `Ack` from the
    /// server.
    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub op_id: Option<String>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct ApplyOperationMessage {
    /// ID of the notebook.
    #[builder(setter(into))]
    pub notebook_id: String,

    /// The operation to apply.
    pub operation: Operation,

    /// The revision assigned to the operation.
    ///
    /// If a client sends this message, it *requests* this revision to be
    /// assigned and the operation may be rejected if the revision is already
    /// assigned.
    ///
    /// When a client receives this message, it is the actual revision.
    pub revision: u32,

    /// Operation ID.
    ///
    /// Only messages with an operation ID will receive an `Ack` from the
    /// server.
    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub op_id: Option<String>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct ApplyOperationBatchMessage {
    /// ID of the notebook.
    #[builder(setter(into))]
    pub notebook_id: String,

    /// The operations to apply.
    pub operations: Vec<Operation>,

    /// The revision assigned to the operation.
    ///
    /// If a client sends this message, it *requests* this revision to be
    /// assigned and the operations may be rejected if the revision is already
    /// assigned.
    ///
    /// When a client receives this message, it is the actual revision.
    pub revision: u32,

    /// Operation ID.
    ///
    /// Only messages with an operation ID will receive an `Ack` from the
    /// server.
    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub op_id: Option<String>,
}

/// Acknowledgement that the server has received and successfully processed an
/// operation sent by the client.
///
/// Acknowledgement are only sent for client message that include some `op_id`.
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct AckMessage {
    /// ID of the operation being acknowledged. This matches the `op_id` sent by
    /// the client.
    pub op_id: String,
}

impl AckMessage {
    pub fn new(op_id: String) -> Self {
        Self { op_id }
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct ErrMessage {
    /// Error message.
    pub error_message: String,

    /// Operation ID.
    ///
    /// This will match the operation ID of the client message that triggered
    /// the error.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub op_id: Option<String>,
}

impl ErrMessage {
    /// Creates a new error with the given message.
    pub fn new(message: impl Into<String>) -> Self {
        Self {
            error_message: message.into(),
            op_id: None,
        }
    }

    /// Assigns the optional operation ID to the message.
    pub fn with_optional_op_id(self, op_id: Option<String>) -> Self {
        Self { op_id, ..self }
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct DebugRequestMessage {
    /// Operation ID.
    ///
    /// Only messages with an operation ID will receive an `Ack` from the
    /// server.
    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub op_id: Option<String>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct DebugResponseMessage {
    /// Session ID.
    #[builder(setter(into))]
    pub sid: String,

    /// Notebooks that the user is subscribed to.
    #[builder(default)]
    pub subscribed_notebooks: Vec<String>,

    /// Operation ID.
    ///
    /// Only messages with an operation ID will receive an `Ack` from the
    /// server.
    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub op_id: Option<String>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct EventAddedMessage {
    /// ID of workspace in which the event was added.
    #[builder(setter(into))]
    pub workspace_id: Base64Uuid,

    /// The event that was added.
    pub event: Event,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct EventUpdatedMessage {
    /// ID of workspace in which the event was updated.
    #[builder(setter(into))]
    pub workspace_id: Base64Uuid,

    /// The event that was updated.
    pub event: Event,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct EventDeletedMessage {
    /// ID of workspace in which the event was deleted.
    #[builder(setter(into))]
    pub workspace_id: Base64Uuid,

    /// ID of the event that was deleted.
    pub event_id: String,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct MentionMessage {
    /// ID of the notebook in which the user was mentioned.
    #[builder(setter(into))]
    pub notebook_id: String,

    /// ID of the cell in which the user was mentioned.
    #[builder(setter(into))]
    pub cell_id: String,

    /// Who mentioned the user?
    pub mentioned_by: MentionedBy,
}

#[derive(Debug, Clone, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct MentionedBy {
    #[builder(setter(into))]
    pub name: String,
}

/// Message sent when an apply operation was rejected by the server.
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct RejectedMessage {
    /// The reason why the operation was rejected.
    pub reason: Box<RejectReason>,

    /// Operation ID.
    ///
    /// Only messages with an operation ID will receive an `Ack` from the
    /// server.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub op_id: Option<String>,
}

impl RejectedMessage {
    pub fn new(reason: RejectReason, op_id: Option<String>) -> Self {
        Self {
            reason: Box::new(reason),
            op_id,
        }
    }
}

/// Reason why the apply operation was rejected.
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum RejectReason {
    /// The operation referenced an invalid cell index.
    CellIndexOutOfBounds,

    /// The operation referenced a non-existing cell.
    #[serde(rename_all = "camelCase")]
    CellNotFound { cell_id: String },

    /// The operation tried to insert a cell with a non-unique ID.
    #[serde(rename_all = "camelCase")]
    DuplicateCellId { cell_id: String },

    /// A label was submitted for already exists for the notebook.
    DuplicateLabel(DuplicateLabelRejectReason),

    /// The operation failed some miscellaneous precondition.
    #[serde(rename_all = "camelCase")]
    FailedPrecondition { message: String },

    /// A label was submitted that was invalid.
    InvalidLabel(InvalidLabelRejectReason),

    /// Current notebook state does not match old state in operation.
    InconsistentState,

    /// Current notebook state does not match old state in operation.
    #[serde(rename_all = "camelCase")]
    InconsistentFrontMatter { message: String },

    /// Attempted to perform a text operation on a non-text cell.
    #[serde(rename_all = "camelCase")]
    NoTextCell { cell_id: String },

    /// The requested apply operation was for an old version. The u32 contains
    /// the current revision.
    Outdated(OutdatedRejectReason),

    /// The operation is unknown yet, and cannot be validated
    #[serde(rename_all = "camelCase")]
    UnknownOperation { operation_summary: String },
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct OutdatedRejectReason {
    /// The current revision for the notebook.
    pub current_revision: u32,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct InvalidLabelRejectReason {
    /// The key of the label that was invalid.
    pub key: String,

    /// The specific reason why the label was invalid.
    pub validation_error: LabelValidationError,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct DuplicateLabelRejectReason {
    /// The key of the label that was already present.
    pub key: String,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct SubscriberAddedMessage {
    /// The ID of the notebook that the user subscribed to.
    #[builder(setter(into))]
    pub notebook_id: String,

    /// ID associated with the newly connected session. There can be multiple
    /// sessions for a single (notebook|user) pair. The ID can be used multiple
    /// times for different (notebook|user) pairs. The combination of notebook,
    /// user and session will be unique.
    #[builder(setter(into))]
    pub session_id: String,

    /// The moment the session was created.
    #[builder(setter(into))]
    pub created_at: Timestamp,

    /// The last time the user was active in this session.
    #[builder(setter(into))]
    pub updated_at: Timestamp,

    /// User details associated with the session.
    pub user: User,

    /// User's focus within the notebook.
    #[builder(default)]
    #[serde(default)]
    pub focus: NotebookFocus,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct SubscriberRemovedMessage {
    /// The ID of the notebook that the user unsubscribed from.
    #[builder(setter(into))]
    pub notebook_id: String,

    /// ID of the session that was removed.
    #[builder(setter(into))]
    pub session_id: String,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct User {
    /// The ID of the user. Will always be the same for the same user, so can be
    /// used for de-dupping or input for color generation.
    #[builder(setter(into))]
    pub id: String,

    /// Name of the user
    #[builder(setter(into))]
    pub name: String,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct FocusInfoMessage {
    /// ID of the notebook.
    #[builder(setter(into))]
    pub notebook_id: String,

    /// User's focus within the notebook.
    #[builder(default)]
    #[serde(default)]
    pub focus: NotebookFocus,

    /// Operation ID.
    ///
    /// Only messages with an operation ID will receive an `Ack` from the
    /// server.
    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub op_id: Option<String>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct UserTypingCommentClientMessage {
    #[builder(setter(into))]
    pub notebook_id: Base64Uuid,

    #[builder(setter(into))]
    pub thread_id: Base64Uuid,

    /// Operation ID.
    ///
    /// Only messages with an operation ID will receive an `Ack` from the
    /// server.
    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub op_id: Option<String>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct SubscribeWorkspaceMessage {
    /// ID of the workspace.
    #[builder(setter(into))]
    pub workspace_id: Base64Uuid,

    /// Operation ID.
    ///
    /// Only messages with an operation ID will receive an `Ack` from the
    /// server.
    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub op_id: Option<String>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct UnsubscribeWorkspaceMessage {
    /// ID of the workspace.
    #[builder(setter(into))]
    pub workspace_id: Base64Uuid,

    /// Operation ID.
    ///
    /// Only messages with an operation ID will receive an `Ack` from the
    /// server.
    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub op_id: Option<String>,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct SubscriberChangedFocusMessage {
    /// ID of the session.
    #[builder(setter(into))]
    pub session_id: String,

    /// ID of the notebook.
    #[builder(setter(into))]
    pub notebook_id: String,

    /// User's focus within the notebook.
    #[serde(default)]
    pub focus: NotebookFocus,
}

/// A single focus position within a notebook.
///
/// Focus can be placed within a cell, and optionally within separate fields
/// within the cell. An offset can be specified to indicate the exact position
/// of the cursor within a text field.
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct FocusPosition {
    /// ID of the focused cell.
    ///
    /// May be the ID of an actual cell, or a so-called "surrogate ID", such as
    /// the ID that indicates focus is on the title field.
    #[builder(setter(into))]
    pub cell_id: String,

    /// Key to identify which field inside a cell has focus.
    /// May be `None` for cells that have only one (or no) text field.
    /// E.g.: For time range cells, “to” or “from” could be used.
    ///
    /// Note that fields do not necessarily have to be text fields. For example,
    /// we could also use this to indicate the user has focused a button for
    /// graph navigation.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub field: Option<String>,

    /// Offset within the text field.
    /// May be `None` if the focus is not inside a text field.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub offset: Option<u32>,
}

/// Specifies the user's focus and optional selection within the notebook.
#[derive(Clone, Debug, Default, Deserialize, PartialEq, Eq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum NotebookFocus {
    /// The user has no focus within the notebook.
    #[default]
    None,
    /// The user focus is within the notebook and the focus is on a single
    /// position. I.e. there is no selection.
    Collapsed(FocusPosition),
    /// The user has a selection within the notebook that started at the given
    /// anchor position and ends at the given focus position.
    Selection {
        anchor: FocusPosition,
        focus: FocusPosition,
    },
}

impl NotebookFocus {
    pub fn anchor_cell_id(&self) -> Option<&str> {
        match self {
            Self::None => None,
            Self::Collapsed(collapsed) => Some(&collapsed.cell_id),
            Self::Selection { anchor, .. } => Some(&anchor.cell_id),
        }
    }

    pub fn anchor_cell_index(&self, cell_ids: &[&str]) -> Option<usize> {
        cell_ids
            .iter()
            .position(|cell_id| Some(*cell_id) == self.anchor_cell_id())
    }

    pub fn anchor_field(&self) -> Option<&str> {
        match self {
            Self::None => None,
            Self::Collapsed(collapsed) => collapsed.field.as_deref(),
            Self::Selection { anchor, .. } => anchor.field.as_deref(),
        }
    }

    pub fn anchor_offset(&self) -> u32 {
        match self {
            Self::None => 0,
            Self::Collapsed(position) => position.offset.unwrap_or_default(),
            Self::Selection { anchor, .. } => anchor.offset.unwrap_or_default(),
        }
    }

    pub fn anchor_position(&self) -> Option<&FocusPosition> {
        match self {
            Self::None => None,
            Self::Collapsed(position) => Some(position),
            Self::Selection { anchor, .. } => Some(anchor),
        }
    }

    pub fn end_cell_id(&self, cell_ids: &[&str]) -> Option<&str> {
        match self {
            Self::None => None,
            Self::Collapsed(position) => Some(&position.cell_id),
            Self::Selection { anchor, focus } => {
                let anchor_cell_index = self.anchor_cell_index(cell_ids).unwrap_or_default();
                let focus_cell_index = self.focus_cell_index(cell_ids).unwrap_or_default();
                if anchor_cell_index > focus_cell_index {
                    Some(&anchor.cell_id)
                } else {
                    Some(&focus.cell_id)
                }
            }
        }
    }

    pub fn end_offset(&self, cell_ids: &[&str]) -> u32 {
        match self {
            Self::None => 0,
            Self::Collapsed(position) => position.offset.unwrap_or_default(),
            Self::Selection { anchor, focus } => {
                let anchor_cell_index = self.anchor_cell_index(cell_ids).unwrap_or_default();
                let anchor_offset = anchor.offset.unwrap_or_default();
                let focus_cell_index = self.focus_cell_index(cell_ids).unwrap_or_default();
                let focus_offset = focus.offset.unwrap_or_default();
                match anchor_cell_index.cmp(&focus_cell_index) {
                    Ordering::Greater => anchor_offset,
                    Ordering::Equal => std::cmp::max(anchor_offset, focus_offset),
                    Ordering::Less => focus_offset,
                }
            }
        }
    }

    pub fn focus_cell_id(&self) -> Option<&str> {
        match self {
            Self::None => None,
            Self::Collapsed(collapsed) => Some(&collapsed.cell_id),
            Self::Selection { focus, .. } => Some(&focus.cell_id),
        }
    }

    pub fn focus_cell_index(&self, cell_ids: &[&str]) -> Option<usize> {
        cell_ids
            .iter()
            .position(|cell_id| Some(*cell_id) == self.focus_cell_id())
    }

    pub fn focus_field(&self) -> Option<&str> {
        match self {
            Self::None => None,
            Self::Collapsed(collapsed) => collapsed.field.as_deref(),
            Self::Selection { focus, .. } => focus.field.as_deref(),
        }
    }

    pub fn focus_offset(&self) -> u32 {
        match self {
            Self::None => 0,
            Self::Collapsed(position) => position.offset.unwrap_or_default(),
            Self::Selection { focus, .. } => focus.offset.unwrap_or_default(),
        }
    }

    pub fn focus_position(&self) -> Option<&FocusPosition> {
        match self {
            Self::None => None,
            Self::Collapsed(position) => Some(position),
            Self::Selection { focus, .. } => Some(focus),
        }
    }

    pub fn has_selection(&self) -> bool {
        !self.is_collapsed()
    }

    /// Returns whether the cursor position is collapsed, ie. the opposite of
    /// `has_selection()`.
    pub fn is_collapsed(&self) -> bool {
        match self {
            Self::None | Self::Collapsed(_) => true,
            Self::Selection { focus, anchor } => *focus == *anchor,
        }
    }

    pub fn is_none(&self) -> bool {
        matches!(self, Self::None)
    }

    pub fn start_cell_id(&self, cell_ids: &[&str]) -> Option<&str> {
        match self {
            Self::None => None,
            Self::Collapsed(position) => Some(&position.cell_id),
            Self::Selection { anchor, focus } => {
                if self.anchor_cell_index(cell_ids).unwrap_or_default()
                    < self.focus_cell_index(cell_ids).unwrap_or_default()
                {
                    Some(&anchor.cell_id)
                } else {
                    Some(&focus.cell_id)
                }
            }
        }
    }

    pub fn start_offset(&self, cell_ids: &[&str]) -> u32 {
        match self {
            Self::None => 0,
            Self::Collapsed(position) => position.offset.unwrap_or_default(),
            Self::Selection { anchor, focus } => {
                let anchor_cell_index = self.anchor_cell_index(cell_ids).unwrap_or_default();
                let anchor_offset = anchor.offset.unwrap_or_default();
                let focus_cell_index = self.focus_cell_index(cell_ids).unwrap_or_default();
                let focus_offset = focus.offset.unwrap_or_default();
                match anchor_cell_index.cmp(&focus_cell_index) {
                    Ordering::Less => anchor_offset,
                    Ordering::Equal => std::cmp::min(anchor_offset, focus_offset),
                    Ordering::Greater => focus_offset,
                }
            }
        }
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct ThreadAddedMessage {
    #[builder(setter(into))]
    pub notebook_id: String,

    pub thread: Thread,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct ThreadItemAddedMessage {
    #[builder(setter(into))]
    pub notebook_id: String,

    #[builder(setter(into))]
    pub thread_id: String,

    pub thread_item: ThreadItem,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct ThreadItemUpdatedMessage {
    #[builder(setter(into))]
    pub notebook_id: String,

    #[builder(setter(into))]
    pub thread_id: String,

    pub thread_item: ThreadItem,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct ThreadDeletedMessage {
    #[builder(setter(into))]
    pub notebook_id: String,

    #[builder(setter(into))]
    pub thread_id: String,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::realtime")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct UserTypingCommentServerMessage {
    #[builder(setter(into))]
    pub notebook_id: String,

    #[builder(setter(into))]
    pub thread_id: String,

    pub user: UserSummary,

    #[builder(setter(into))]
    pub updated_at: Timestamp,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn serialize_reject_reason() {
        let reason = OutdatedRejectReason {
            current_revision: 1,
        };
        let reason = RejectReason::Outdated(reason);
        let result = serde_json::to_string(&reason);
        if let Err(err) = result {
            panic!("Unexpected error occurred: {err:?}");
        }
    }
}
