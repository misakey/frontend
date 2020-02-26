import errorTypes from '@misakey/ui/constants/errorTypes';

import { getDetails, getCode } from '@misakey/helpers/apiError';

// CONSTANTS
const { conflict, forbidden } = errorTypes;

// CLASS
export default class AuthNotConfirmedConflict extends Error {
  constructor(message) {
    super(message);
    this[message] = conflict;
  }
}

// HELPERS
export const handleAuthNotConfirmedConflict = (message) => (apiError) => {
  const details = getDetails(apiError);
  const code = getCode(apiError);
  const { confirmed } = details;
  if (code === forbidden && confirmed === conflict) {
    throw new AuthNotConfirmedConflict(message);
  }
};

export const isAuthNotConfirmedConflict = (error) => error instanceof AuthNotConfirmedConflict;
