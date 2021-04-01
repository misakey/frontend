
import objectToCamelCase from '@misakey/core/helpers/objectToCamelCase';
import { handleResponse } from '@misakey/core/api/Endpoint/send';

// Do not use object API here as this builder is called during
// API object construction, circular dependency
export const getCsrfTokenBuilder = () => fetch(
  `${window.env.API_ENDPOINT}/csrf`,
  { mode: 'cors', credentials: 'include' },
)
  .then(handleResponse)
  .then(objectToCamelCase)
  .then(({ csrfToken }) => csrfToken);
