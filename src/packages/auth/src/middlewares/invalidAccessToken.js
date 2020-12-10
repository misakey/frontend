import isFunction from '@misakey/helpers/isFunction';
import { authReset } from '@misakey/auth/store/actions/auth';
import isNil from '@misakey/helpers/isNil';

const invalidAccessTokenMiddleware = (dispatch, callback) => async (rawResponse, endpoint) => {
  if (rawResponse instanceof Response && rawResponse.status === 401) {
    const error = await rawResponse.clone().json();
    const { origin, details } = error;
    const { accesstoken } = details;

    if (origin === 'cookies' && !isNil(accesstoken)) {
      if (isFunction(dispatch)) {
        dispatch(authReset());
      }
      if (isFunction(callback)) { callback(rawResponse, endpoint); }
    }
  }
};

export default invalidAccessTokenMiddleware;
