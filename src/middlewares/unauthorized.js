import HttpStatus from 'http-status-codes';

import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import isNil from '@misakey/helpers/isNil';
import { getDetails } from '@misakey/helpers/apiError';

// CONSTANTS
const {
  identifierValue: IDENTIFIER_VALUE_SELECTOR,
} = authSelectors;

// MIDDLEWARE
export default (askSigninRedirect, store) => (rawResponse) => {
  const match = rawResponse instanceof Response && rawResponse.status === HttpStatus.UNAUTHORIZED;
  if (match) {
    const contentType = rawResponse.headers.get('Content-Type') || '';

    if (contentType.startsWith('application/json')) {
      return rawResponse.clone().json().then((json) => {
        const { requiredAcr } = getDetails(json);
        const identifier = IDENTIFIER_VALUE_SELECTOR(store.getState());
        const loginHint = isNil(identifier) ? '' : JSON.stringify({ identifier });
        askSigninRedirect({ acrValues: requiredAcr, prompt: 'login', loginHint }, false);
        // return something other than error to consider error handled
        return true;
      });
    }
    return null;
  }
  return null;
};
