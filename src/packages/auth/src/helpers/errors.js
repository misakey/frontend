import errorTypes from '@misakey/ui/constants/errorTypes';

import { getDetails, getCode } from '@misakey/helpers/apiError';

// CONSTANTS
const { conflict } = errorTypes;

// HELPERS
export const isAuthStepAlreadyExistsConflict = (error) => {
  const details = getDetails(error);
  const code = getCode(error);
  const { identityId, methodName } = details;
  return code === conflict && identityId === conflict && methodName === conflict;
};
