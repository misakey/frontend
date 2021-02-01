import { StatusCodes } from 'http-status-codes';

import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';

import isNil from '@misakey/helpers/isNil';
import { getDetails } from '@misakey/helpers/apiError';

// CONSTANTS
const {
  identifierValue: IDENTIFIER_VALUE_SELECTOR,
} = authSelectors;

// MIDDLEWARE
export default (askSigninRedirect, store) => async (rawResponse) => {
  const match = rawResponse instanceof Response && rawResponse.status === StatusCodes.UNAUTHORIZED;
  if (match) {
    const contentType = rawResponse.headers.get('Content-Type') || '';

    if (contentType.startsWith('application/json')) {
      const json = await rawResponse.clone().json();
      const { requiredAcr } = getDetails(json);
      const identifier = IDENTIFIER_VALUE_SELECTOR(store.getState());
      const loginHint = isNil(identifier) ? '' : JSON.stringify({ identifier });
      askSigninRedirect({ acrValues: requiredAcr, prompt: 'login', loginHint }, false);
      // return something other than error to consider error handled
      return true;
    }
    return null;
  }
  return null;
};
