import HttpStatus from 'http-status-codes';

import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import isNil from '@misakey/helpers/isNil';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import { getDetails } from '@misakey/helpers/apiError';

// CONSTANTS
const {
  identifierValue: IDENTIFIER_VALUE_SELECTOR,
} = authSelectors;


// MIDDLEWARE
export default (askSigninRedirect, store) => (rawResponse) => {
  const match = rawResponse instanceof Response && rawResponse.status === HttpStatus.FORBIDDEN;
  if (match) {
    const contentType = rawResponse.headers.get('Content-Type') || '';

    if (contentType.startsWith('application/json')) {
      rawResponse.clone().json().then((json) => {
        const { origin } = json;
        if (origin === 'acr') {
          const details = getDetails(json);
          const { requiredAcr } = objectToCamelCase(details);
          const identifier = IDENTIFIER_VALUE_SELECTOR(store.getState());
          const loginHint = isNil(identifier) ? '' : JSON.stringify({ identifier });
          askSigninRedirect({ acrValues: requiredAcr, prompt: 'login', loginHint }, false);
        }
      });
    }
  }
};
