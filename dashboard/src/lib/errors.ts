/** Error thrown by the API layer. `fieldErrors` map form field names to messages. */

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors?: Record<string, string>;
  readonly code?: string;

  constructor(
    message: string,
    status = 400,
    fieldErrors?: Record<string, string>,
    code?: string,
  ) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.code = code;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
