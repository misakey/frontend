import isFunction from '@misakey/helpers/isFunction';
import { authReset } from '@misakey/auth/store/actions/auth';

// @FIXME @misakey/auth
const invalidTokenMiddleware = (dispatch, callback) => (rawResponse, endpoint) => {
  // seen with @slevin condition matches only invalid or expired token
  const match = rawResponse.status === 401 && endpoint.auth === true;

  if (match && isFunction(dispatch)) {
    dispatch(authReset());
    if (isFunction(callback)) { callback(rawResponse, endpoint); }
  }
};

export default invalidTokenMiddleware;
