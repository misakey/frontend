import { conflict } from '@misakey/ui/constants/errorTypes';

import { isAuthStepAlreadyExistsConflict } from '@misakey/auth/helpers/errors';


// CLASS
export default class AuthStepAlreadyExistsConflict extends Error {
  constructor(message) {
    super(message);
    this[message] = conflict;
  }
}

// HELPERS
export const handleAuthStepAlreadyExistsConflict = (message) => (apiError) => {
  if (isAuthStepAlreadyExistsConflict(apiError)) {
    throw new AuthStepAlreadyExistsConflict(message);
  }
};
