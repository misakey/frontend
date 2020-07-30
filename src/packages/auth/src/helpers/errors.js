import errorTypes from '@misakey/ui/constants/errorTypes';

import { getDetails, getCode } from '@misakey/helpers/apiError';

// CONSTANTS
const { conflict, notFound, forbidden } = errorTypes;

const HYDRA_ERRORS = [notFound, forbidden];

// HELPERS
export const isAuthStepAlreadyExistsConflict = (error) => {
  const details = getDetails(error);
  const code = getCode(error);
  const { identityId, methodName } = details;
  return code === conflict && identityId === conflict && methodName === conflict;
};

export const isHydraErrorCode = (code) => HYDRA_ERRORS.includes(code);
