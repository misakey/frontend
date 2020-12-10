import errorTypes from '@misakey/ui/constants/errorTypes';
import { getDetails } from '@misakey/helpers/apiError';

const { invalid } = errorTypes;

const invalidCsrfTokenMiddleware = (onMatch) => async (rawResponse) => {
  if (rawResponse instanceof Response && rawResponse.status === 403) {
    const error = await rawResponse.clone().json();
    const { csrfToken } = getDetails(error);

    if (csrfToken === invalid) {
      onMatch();
    }
  }
};

export default invalidCsrfTokenMiddleware;
