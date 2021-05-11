import API from '@misakey/core/api';

import objectToCamelCase from '@misakey/core/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/core/helpers/objectToSnakeCase';

export const listDatatags = (queryParams = {}) => API
  .use(API.endpoints.datatags.find)
  .build(null, null, objectToSnakeCase(queryParams))
  .send()
  .then((response) => response.map(objectToCamelCase));
