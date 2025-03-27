// HttpError is a custom error class that extends the built-in Error class.
// It is used to represent HTTP errors in the application.
//
// The constructor takes an error message and an optional status code.
// The status code defaults to 500 if not provided.
//
// The `toResponse` method returns a Response object with the error message
// and status code set in the body and status properties, respectively.
//
// The `toJSON` method returns an object with the error message and status code.
// This is useful for logging the error as JSON.
//
// The `toString` method returns a string representation of the error.
// This is useful for logging the error as a string.
//
// The `status` property is the status code of the error.
// The `message` property is the error message.
// The `name` property is the name of the error class.
// The `stack` property is the stack trace of the error.
//
// Example usage:
// ```ts
// try {
//   throw new HttpError("Not Found", 404);
// } catch (error) {
//   console.error(error.toString());
//   console.error(error.toJSON());
//   console.error(error.toResponse());
// }
// ```
// The above code will output:
// ```
// HttpError: Not Found
// {"message":"Not Found","status":404}
// Response { status: 404, statusText: 'Not Found', headers: Headers { [Symbol(map)]: [Object: null prototype] {} }, url: '', ok: false }
// ```

export class HttpError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }

  toResponse(): Response {
    return new Response(this.message, { status: this.status });
  }

  toJSON() {
    return { message: this.message, status: this.status };
  }

  toString() {
    return `${this.name}: ${this.message}`;
  }
}
