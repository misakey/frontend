import API from '@misakey/core/api';

import objectToSnakeCase from '@misakey/core/helpers/objectToSnakeCase';
import objectToCamelCaseDeep from '@misakey/core/helpers/objectToCamelCaseDeep';

export default (payload) => API
  .use(API.endpoints.auth.identities.update)
  .build(null, objectToSnakeCase(payload))
  .send()
  .then(objectToCamelCaseDeep);
