import API from '@misakey/api';
import { AUTH_RESET, LOAD_USER, SIGN_IN, SIGN_OUT } from '../store/actions/auth';

export default () => (next) => (action) => {
  switch (action.type) {
    case SIGN_IN:
    case LOAD_USER:
      if (action.token) {
        API.setToken(action.token);
      }
      break;
    case AUTH_RESET:
    case SIGN_OUT:
      API.deleteToken();
      break;
    default:
      break;
  }

  return next(action);
};
