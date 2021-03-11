import isFunction from '@misakey/helpers/isFunction';
import isNil from '@misakey/helpers/isNil';

// @FIXME @misakey/api
const networkErrorMiddleware = (onNetworkError, onNetworkSuccess) => (errorOrResponse) => {
  const successMatch = errorOrResponse instanceof Response;

  const errorMatch = errorOrResponse instanceof TypeError
  // Safety extra checks not to handle unexpected errorOrResponses
  && isNil(errorOrResponse.code) && isNil(errorOrResponse.status);

  if (errorMatch && isFunction(onNetworkError)) {
    onNetworkError(errorOrResponse);
  }

  if (successMatch && isFunction(onNetworkSuccess)) {
    onNetworkSuccess(errorOrResponse);
  }
};

export default networkErrorMiddleware;
