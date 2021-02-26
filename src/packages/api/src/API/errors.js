import { StatusCodes } from 'http-status-codes';

export const HTTP_ERROR_STATUSES = [
  StatusCodes.BAD_REQUEST,
  StatusCodes.CONFLICT,
  StatusCodes.FORBIDDEN,
  StatusCodes.INTERNAL_SERVER_ERROR,
  StatusCodes.LOCKED,
  StatusCodes.METHOD_NOT_ALLOWED,
  StatusCodes.NOT_FOUND,
  StatusCodes.PAYMENT_REQUIRED,
  StatusCodes.REQUEST_TIMEOUT,
  StatusCodes.REQUEST_TOO_LONG,
  StatusCodes.SERVICE_UNAVAILABLE,
  StatusCodes.TOO_MANY_REQUESTS,
  StatusCodes.UNAUTHORIZED,
  StatusCodes.UNSUPPORTED_MEDIA_TYPE,
];

export const filterHttpStatus = (s) => (HTTP_ERROR_STATUSES.includes(s) ? s : undefined);


export class HandledError extends Error {
  constructor(params) {
    super(params);

    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#custom_error_types
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HandledError);
    }
    this.name = 'HandledError';
  }
}
