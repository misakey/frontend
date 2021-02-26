import isFunction from '@misakey/helpers/isFunction';
import { StatusCodes } from 'http-status-codes';
import { authReset } from '@misakey/react-auth/store/actions/auth';
import isNil from '@misakey/helpers/isNil';
import { HandledError } from '@misakey/api/API/errors';

const isMatch = async (rawResponse, endpoint) => {
  // HEAD cannot return JSON
  if (endpoint.method === 'HEAD') { return true; }
  const contentType = rawResponse.headers.get('Content-Type');
  if (!isNil(contentType) && contentType.startsWith('application/json')) {
    const error = await rawResponse.clone().json();
    const { origin, details } = error;
    const { accesstoken } = details;

    return (origin === 'cookies' && !isNil(accesstoken));
  }
  return false;
};

const invalidAccessTokenMiddleware = (dispatch, callback) => async (rawResponse, endpoint) => {
  if (rawResponse instanceof Response && rawResponse.status === StatusCodes.UNAUTHORIZED) {
    if (isMatch(rawResponse, endpoint)) {
      if (isFunction(dispatch)) {
        dispatch(authReset());
      }
      if (isFunction(callback)) { callback(rawResponse, endpoint); }
      return new HandledError('invalidAccessToken');
    }
  }
  return undefined;
};

export default invalidAccessTokenMiddleware;
