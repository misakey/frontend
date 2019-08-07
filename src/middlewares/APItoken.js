import API from '@misakey/api';
import isObject from '@misakey/helpers/isObject';
import { AUTH_RESET, SIGN_IN, SIGN_OUT } from 'store/actions/auth';

const authPersistKey = 'auth';
const REHYDRATE = 'persist/REHYDRATE';

export default () => next => (action) => {
  switch (action.type) {
    case SIGN_IN:
      if (action.token) {
        API.setToken(action.token);
      }
      break;
    case AUTH_RESET:
    case SIGN_OUT:
      API.deleteToken();
      break;
    case REHYDRATE:
      if (action.key === authPersistKey && isObject(action.payload)) {
        API.setToken(action.payload.token);
      }
      break;
    default:
      break;
  }

  return next(action);
};
