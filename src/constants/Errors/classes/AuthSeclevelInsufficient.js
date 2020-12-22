import { required, forbidden } from '@misakey/ui/constants/errorTypes';

import { getDetails, getCode } from '@misakey/helpers/apiError';

// CONSTANTS
// @FIXME maybe move this type to errorTypes? Not required until used in another place of the app
const ERROR_TYPE = 'seclevel_insufficient';

// CLASS
export default class AuthSeclevelInsufficient extends Error {
  constructor(message) {
    super(message);
    this[message] = ERROR_TYPE;
  }
}


export const handleAuthSeclevelInsufficient = (message) => (apiError) => {
  const details = getDetails(apiError);
  const code = getCode(apiError);
  const { password } = details;
  if (code === forbidden && password === required) {
    throw new AuthSeclevelInsufficient(message);
  }
};

export const isAuthSeclevelInsufficient = (error) => error instanceof AuthSeclevelInsufficient;
