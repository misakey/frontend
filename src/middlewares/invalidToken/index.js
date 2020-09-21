import isFunction from '@misakey/helpers/isFunction';
import { authReset } from '@misakey/auth/store/actions/auth';

// @FIXME @misakey/auth
const invalidTokenMiddleware = (dispatch, callback) => (rawResponse, endpoint) => {
  // This condition can exceptionaly match other than invalid or expired token
  // For now as we remove only token from redux store and not for localStorage
  // consequences are acceptable (case 401 !== no valid token are rare,
  // if hydra cannot answer for example) in that case it's safer to do as is user is not
  // authenticated anymore.
  const match = rawResponse.status === 401 && endpoint.auth === true;

  if (match && isFunction(dispatch)) {
    dispatch(authReset());
    if (isFunction(callback)) { callback(rawResponse, endpoint); }
  }
};

export default invalidTokenMiddleware;
