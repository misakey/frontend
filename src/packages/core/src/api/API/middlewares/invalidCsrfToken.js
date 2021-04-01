import { invalid } from '@misakey/core/api/constants/errorTypes';
import { getDetails } from '@misakey/core/helpers/apiError';
import isNil from '@misakey/core/helpers/isNil';

// HELPERS
const invalidCsrfTokenMiddleware = (onMatch) => async (rawResponse) => {
  if (rawResponse instanceof Response && rawResponse.status === 403) {
    const contentType = rawResponse.headers.get('Content-Type');
    if (!isNil(contentType) && contentType.startsWith('application/json')) {
      if (contentType.startsWith('application/json')) {
        const error = await rawResponse.clone().json();
        const { csrfToken } = getDetails(error);

        if (csrfToken === invalid) {
          onMatch();
        }
      }
    }
  }
};

export default invalidCsrfTokenMiddleware;
