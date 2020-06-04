import errorTypes from '@misakey/ui/constants/errorTypes';

import { getDetails, getCode } from '@misakey/helpers/apiError';

// CONSTANTS
const { conflict } = errorTypes;

// CLASS
export default class AuthStepAlreadyExistsConflict extends Error {
  constructor(message) {
    super(message);
    this[message] = conflict;
  }
}

// HELPERS
export const isAuthStepAlreadyExistsConflict = (error) => {
  const details = getDetails(error);
  const code = getCode(error);
  const { identityId, methodName } = details;
  return code === conflict && identityId === conflict && methodName === conflict;
};

export const handleAuthStepAlreadyExistsConflict = (message) => (apiError) => {
  if (isAuthStepAlreadyExistsConflict(apiError)) {
    throw new AuthStepAlreadyExistsConflict(message);
  }
};
