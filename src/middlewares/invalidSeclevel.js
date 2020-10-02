import HttpStatus from 'http-status-codes';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import { authSeclevelWarningShow } from 'store/actions/warning';


const invalidSeclevelnMiddleware = (dispatch) => (rawResponse) => {
  const match = rawResponse instanceof Response && rawResponse.status === HttpStatus.FORBIDDEN;
  if (match) {
    const contentType = rawResponse.headers.get('Content-Type') || '';

    if (contentType.startsWith('application/json')) {
      rawResponse.clone().json().then((json) => {
        const { origin, details } = json;
        if (origin === 'acr') {
          const { requiredAcr } = objectToCamelCase(details);
          dispatch(authSeclevelWarningShow(requiredAcr));
        }
      });
    }
  }
};

export default invalidSeclevelnMiddleware;
