import API from '@misakey/api';
import { SSO_SIGN, SSO_RESET, SSO_UNSIGN } from '@misakey/auth/store/actions/sso';

import path from '@misakey/helpers/path';
import { AUTH_RESET, LOAD_USER, SIGN_IN, SIGN_OUT } from '../store/actions/auth';

// HELPERS
const tokenPath = path(['credentials', 'token']);

export default () => (next) => (action) => {
  const token = tokenPath(action);
  const { accessToken, type } = action;
  switch (type) {
    case SSO_SIGN:
      if (accessToken) {
        API.setToken(accessToken);
      }
      break;
    case SIGN_IN:
    case LOAD_USER:
      if (token) {
        API.setToken(token);
      }
      break;
    case AUTH_RESET:
    case SSO_RESET:
    case SSO_UNSIGN:
    case SIGN_OUT:
      API.deleteToken();
      break;
    default:
      break;
  }

  return next(action);
};
