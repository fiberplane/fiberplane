abstract class DurableObject<Env = unknown> {
  protected ctx: DurableObjectState;
  protected env: Env;
  constructor(ctx: DurableObjectState, env: Env) {
    this.ctx = ctx;
    this.env = env;
  }
  fetch?(request: Request): Response | Promise<Response>;
  alarm?(alarmInfo?: AlarmInvocationInfo): void | Promise<void>;
  webSocketMessage?(
    ws: WebSocket,
    message: string | ArrayBuffer,
  ): void | Promise<void>;
  webSocketClose?(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean,
  ): void | Promise<void>;
  webSocketError?(ws: WebSocket, error: unknown): void | Promise<void>;
}

abstract class Server<Env = unknown> extends DurableObject<Env> {
  // constructor(ctx: DurableObjectState, env: Env);
  /**
   * Handle incoming requests to the server.
   */
  abstract fetch(request: Request): Promise<Response>;
  abstract webSocketMessage(ws: WebSocket, message: WSMessage): Promise<void>;
  abstract webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean
  ): Promise<void>;
  abstract webSocketError(ws: WebSocket, error: unknown): Promise<void>;
  /**
   * The name for this server. Write-once-only.
   */
  abstract get name(): string;
  abstract setName(name: string): Promise<void>;
  /** Send a message to all connected clients, except connection ids listed in `without` */
  abstract broadcast(
    msg: string | ArrayBuffer | ArrayBufferView,
    without?: string[] | undefined
  ): void;
  /** Get a connection by connection id */
  abstract getConnection<TState = unknown>(id: string): Connection<TState> | undefined;
  /**
   * Get all connections. Optionally, you can provide a tag to filter returned connections.
   * Use `Server#getConnectionTags` to tag the connection on connect.
   */
  abstract getConnections<TState = unknown>(tag?: string): Iterable<Connection<TState>>;
  /**
   * You can tag a connection to filter them in Server#getConnections.
   * Each connection supports up to 9 tags, each tag max length is 256 characters.
   */
  abstract getConnectionTags(
    connection: Connection,
    context: ConnectionContext
  ): string[] | Promise<string[]>;
  /**
   * Called when the server is started for the first time.
   */
  abstract onStart(): void | Promise<void>;
  /**
   * Called when a new connection is made to the server.
   */
  abstract onConnect(
    connection: Connection,
    ctx: ConnectionContext
  ): void | Promise<void>;
  /**
   * Called when a message is received from a connection.
   */
  abstract onMessage(connection: Connection, message: WSMessage): void | Promise<void>;
  /**
   * Called when a connection is closed.
   */
  abstract onClose(
    connection: Connection,
    code: number,
    reason: string,
    wasClean: boolean
  ): void | Promise<void>;
  /**
   * Called when an error occurs on a connection.
   */
  abstract onError(connection: Connection, error: unknown): void | Promise<void>;
  /**
   * Called when a request is made to the server.
   */
  abstract onRequest(request: Request): Response | Promise<Response>;
  abstract onAlarm(): void | Promise<void>;
  abstract alarm(): Promise<void>;
}



export abstract class IAgent<Env, State = unknown> extends Server<Env> {
  /**
   * Initial state for the Agent
   * Override to provide default state values
   */
  abstract initialState: State;
  /**
   * Current state of the Agent
   */
  abstract get state(): State;
  /**
   * Agent configuration options
   */
  // static options: {
  //   /** Whether the Agent should hibernate when inactive */
  //   hibernate: boolean;
  // };
  /**
   * Execute SQL queries against the Agent's database
   * @template T Type of the returned rows
   * @param strings SQL query template strings
   * @param values Values to be inserted into the query
   * @returns Array of query results
   */
  abstract sql<T = Record<string, string | number | boolean | null>>(
    strings: TemplateStringsArray,
    ...values: (string | number | boolean | null)[]
  ): T[];
  // constructor(ctx: AgentContext, env: Env);
  /**
   * Update the Agent's state
   * @param state New state to set
   */
  abstract setState(state: State): void;
  /**
   * Called when the Agent's state is updated
   * @param state Updated state
   * @param source Source of the state update ("server" or a client connection)
   */
  abstract onStateUpdate(state: State | undefined, source: Connection | "server"): void;
  /**
   * Called when the Agent receives an email
   * @param email Email message to process
   */
  abstract onEmail(email: ForwardableEmailMessage): Promise<void>;
  abstract onError(connection: Connection, error: unknown): void | Promise<void>;
  abstract onError(error: unknown): void | Promise<void>;
  /**
   * Render content (not implemented in base class)
   */
  abstract render(): void;
  /**
   * Schedule a task to be executed in the future
   * @template T Type of the payload data
   * @param when When to execute the task (Date, seconds delay, or cron expression)
   * @param callback Name of the method to call
   * @param payload Data to pass to the callback
   * @returns Schedule object representing the scheduled task
   */
  abstract schedule<T = string>(
    when: Date | string | number,
    callback: keyof this,
    payload?: T
  ): Promise<Schedule<T>>;
  /**
   * Get a scheduled task by ID
   * @template T Type of the payload data
   * @param id ID of the scheduled task
   * @returns The Schedule object or undefined if not found
   */
  abstract getSchedule<T = string>(id: string): Promise<Schedule<T> | undefined>;
  /**
   * Get scheduled tasks matching the given criteria
   * @template T Type of the payload data
   * @param criteria Criteria to filter schedules
   * @returns Array of matching Schedule objects
   */
  abstract getSchedules<T = string>(criteria?: {
    description?: string;
    id?: string;
    type?: "scheduled" | "delayed" | "cron";
    timeRange?: {
      start?: Date;
      end?: Date;
    };
  }): Schedule<T>[];
  /**
   * Cancel a scheduled task
   * @param id ID of the task to cancel
   * @returns true if the task was cancelled, false otherwise
   */
  abstract cancelSchedule(id: string): Promise<boolean>;
  /**
   * Method called when an alarm fires
   * Executes any scheduled tasks that are due
   */
  abstract alarm(): Promise<void>;
  /**
   * Destroy the Agent, removing all state and scheduled tasks
   */
  abstract destroy(): Promise<void>;
}
type ImmutablePrimitive = undefined | null | boolean | string | number;
type Immutable<T> = T extends ImmutablePrimitive
  ? T
  : T extends Array<infer U>
  ? ImmutableArray<U>
  : T extends Map<infer K, infer V>
  ? ImmutableMap<K, V>
  : T extends Set<infer M>
  ? ImmutableSet<M>
  : ImmutableObject<T>;
type ImmutableArray<T> = ReadonlyArray<Immutable<T>>;
type ImmutableMap<K, V> = ReadonlyMap<Immutable<K>, Immutable<V>>;
type ImmutableSet<T> = ReadonlySet<Immutable<T>>;
type ImmutableObject<T> = {
  readonly [K in keyof T]: Immutable<T[K]>;
};

type ConnectionState<T> = ImmutableObject<T> | null;
/**
 * Connection object for WebSocket connections
 */
// export interface Connection {
//   /** Send a message to the connection */
//   send(message: string): void;
//   /** Close the connection */
//   close(code?: number, reason?: string): void;
// }

export type Connection<TState = unknown> = WebSocket & {
  /** Connection identifier */
  id: string;
  /**
   * Arbitrary state associated with this connection.
   * Read-only, use Connection.setState to update the state.
   */
  // state: ConnectionState<TState>;
  // setState(
  //   state: TState | ConnectionSetStateFn<TState> | null
  // ): ConnectionState<TState>;
  // /** @deprecated use Connection.setState instead */
  // serializeAttachment<T = unknown>(attachment: T): void;
  // /** @deprecated use Connection.state instead */
  // deserializeAttachment<T = unknown>(): T | null;
  /**
   * Server's name
   */
  server: string;
};


/**
 * Context for WebSocket connections
 */
export interface ConnectionContext {
  /** HTTP request that initiated the connection */
  request: Request;
}

/**
 * WebSocket message type
 */
export type WSMessage = string | ArrayBuffer | ArrayBufferView;

export type Schedule<T = string> = {
  /** Unique identifier for the schedule */
  id: string;
  /** Name of the method to be called */
  callback: string;
  /** Data to be passed to the callback */
  payload: T;
} & (
    | {
      /** Type of schedule for one-time execution at a specific time */
      type: "scheduled";
      /** Timestamp when the task should execute */
      time: number;
    }
    | {
      /** Type of schedule for delayed execution */
      type: "delayed";
      /** Timestamp when the task should execute */
      time: number;
      /** Number of seconds to delay execution */
      delayInSeconds: number;
    }
    | {
      /** Type of schedule for recurring execution based on cron expression */
      type: "cron";
      /** Timestamp for the next execution */
      time: number;
      /** Cron expression defining the schedule */
      cron: string;
    }
  );

// export interface ForwardableEmailMessage {
//   from: string;
//   to: string[];
//   subject?: string;
//   text?: string;
//   html?: string;
//   headers?: Record<string, string>;
//   attachments?: Array<{
//     filename?: string;
//     content: ArrayBuffer;
//     contentType?: string;
//   }>;
// }
interface EmailMessage {
  /**
   * Envelope From attribute of the email message.
   */
  readonly from: string;
  /**
   * Envelope To attribute of the email message.
   */
  readonly to: string;
}


export interface ForwardableEmailMessage extends EmailMessage {
  /**
   * Stream of the email message content.
   */
  readonly raw: ReadableStream<Uint8Array>;
  /**
   * An [Headers object](https://developer.mozilla.org/en-US/docs/Web/API/Headers).
   */
  readonly headers: Headers;
  /**
   * Size of the email message content.
   */
  readonly rawSize: number;
  /**
   * Reject this email message by returning a permanent SMTP error back to the connecting client including the given reason.
   * @param reason The reject reason.
   * @returns void
   */
  setReject(reason: string): void;
  /**
   * Forward this email message to a verified destination address of the account.
   * @param rcptTo Verified destination address.
   * @param headers A [Headers object](https://developer.mozilla.org/en-US/docs/Web/API/Headers).
   * @returns A promise that resolves when the email message is forwarded.
   */
  forward(rcptTo: string, headers?: Headers): Promise<void>;
  /**
   * Reply to the sender of this email message with a new EmailMessage object.
   * @param message The reply message.
   * @returns A promise that resolves when the email message is replied.
   */
  reply(message: EmailMessage): Promise<void>;
}
