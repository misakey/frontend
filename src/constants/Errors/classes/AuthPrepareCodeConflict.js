import errorTypes from '@misakey/ui/constants/errorTypes';

import { getDetails, getCode } from '@misakey/helpers/apiError';

// CONSTANTS
const { conflict } = errorTypes;

// CLASS
export default class AuthPrepareCodeConflict extends Error {
  constructor(message) {
    super(message);
    this[message] = conflict;
  }
}

// HELPERS
const isChannelUserConflict = (channel, userId) => channel === conflict && userId === conflict;

export const handleAuthPrepareCodeConflict = (message) => (apiError) => {
  const details = getDetails(apiError);
  const code = getCode(apiError);
  const { channel, userId, renewalDate } = details;
  if (code === conflict && (isChannelUserConflict(channel, userId) || renewalDate)) {
    throw new AuthPrepareCodeConflict(message);
  }
};

export const isAuthPrepareCodeConflict = (error) => error instanceof AuthPrepareCodeConflict;
