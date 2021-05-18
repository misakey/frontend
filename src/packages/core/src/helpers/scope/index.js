import isString from '@misakey/core/helpers/isString';
import isNil from '@misakey/core/helpers/isNil';

// CONSTANTS
const DATA_CONSENT_SCOPE_REGEX = /^datatag\.[^.]+\.[^.]+$/;

// HELPERS
export const toArray = (scopeString) => scopeString.split(' ');

export const stringify = (scopeArray) => scopeArray.join(' ');

export const hasConsentDataScope = (scope) => {
  if (isNil(scope)) {
    return false;
  }
  const arrayScope = isString(scope) ? toArray(scope) : scope;
  return arrayScope.some((singleScope) => DATA_CONSENT_SCOPE_REGEX.test(singleScope));
};
