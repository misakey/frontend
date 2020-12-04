import { StatusCodes } from 'http-status-codes';

import errorTypes from '@misakey/ui/constants/errorTypes';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import isNil from '@misakey/helpers/isNil';
import { getDetails } from '@misakey/helpers/apiError';

// CONSTANTS
const {
  identifierValue: IDENTIFIER_VALUE_SELECTOR,
} = authSelectors;

const { invalid } = errorTypes;

// MIDDLEWARE
export default (askSigninRedirect, store) => async (rawResponse) => {
  const match = rawResponse instanceof Response && rawResponse.status === StatusCodes.FORBIDDEN;
  if (match) {
    const contentType = rawResponse.headers.get('Content-Type') || '';

    if (contentType.startsWith('application/json')) {
      const json = await rawResponse.clone().json();
      const { origin } = json;
      const { xCsrfToken, requiredAcr } = getDetails(json);
      if (origin === 'acr' || xCsrfToken === invalid) {
        const identifier = IDENTIFIER_VALUE_SELECTOR(store.getState());
        const loginHint = isNil(identifier) ? '' : JSON.stringify({ identifier });
        askSigninRedirect({ acrValues: requiredAcr, prompt: 'login', loginHint }, false);
        // return something other than error to consider error handled
        return true;
      }
      // return null to consider error not handled
      return null;
    }
    return null;
  }
  return null;
};
