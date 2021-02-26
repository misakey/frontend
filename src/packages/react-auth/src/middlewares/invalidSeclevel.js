import { StatusCodes } from 'http-status-codes';

import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';

import isNil from '@misakey/helpers/isNil';
import { HandledError } from '@misakey/api/API/errors';
import { getDetails } from '@misakey/helpers/apiError';

// CONSTANTS
const {
  identifierValue: IDENTIFIER_VALUE_SELECTOR,
} = authSelectors;

// MIDDLEWARE
const invalidSeclevelMiddleware = (askSigninRedirect, store) => async (rawResponse) => {
  if (rawResponse instanceof Response && rawResponse.status === StatusCodes.FORBIDDEN) {
    const contentType = rawResponse.headers.get('Content-Type');
    if (!isNil(contentType) && contentType.startsWith('application/json')) {
      const json = await rawResponse.clone().json();
      const { requiredAcr } = getDetails(json);
      if (!isNil(requiredAcr)) {
        const identifier = IDENTIFIER_VALUE_SELECTOR(store.getState());
        const loginHint = isNil(identifier) ? '' : JSON.stringify({ identifier });
        askSigninRedirect({ acrValues: requiredAcr, prompt: 'login', loginHint }, false);
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
