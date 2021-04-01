import { StatusCodes } from 'http-status-codes';

import isNil from '@misakey/core/helpers/isNil';
import { HandledError } from '@misakey/core/api/API/errors';
import { getDetails } from '@misakey/core/helpers/apiError';

// MIDDLEWARE
const invalidSeclevelMiddleware = (onMatch) => async (rawResponse) => {
  if (rawResponse instanceof Response && rawResponse.status === StatusCodes.FORBIDDEN) {
    const contentType = rawResponse.headers.get('Content-Type');
    if (!isNil(contentType) && contentType.startsWith('application/json')) {
      const json = await rawResponse.clone().json();
      const { requiredAcr } = getDetails(json);
      if (!isNil(requiredAcr)) {
        onMatch(parseInt(requiredAcr, 10));
        // return an Error to prevent `handleResponse` to redo the error handling but
        // and to prevent caller to run promise success
        return new HandledError('invalidSeclevel');
      }
    }
  }
  // return undefined to consider error not handled
  return undefined;
};

export default invalidSeclevelMiddleware;
