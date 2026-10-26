export class ApiError extends Error {
  /**
   * @param {number} status HTTP status
   * @param {string} message user-facing message
   * @param {{code?: string, details?: Array<{field?: string, message: string}>}} [opts]
   */
  constructor(status, message, { code, details } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
