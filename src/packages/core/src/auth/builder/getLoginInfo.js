import API from '@misakey/core/api';

import objectToSnakeCase from '@misakey/core/helpers/objectToSnakeCase';
import objectToCamelCaseDeep from '@misakey/core/helpers/objectToCamelCaseDeep';


export default (loginChallenge) => API
  .use(API.endpoints.auth.info)
  .build(null, null, objectToSnakeCase({ loginChallenge }))
  .send()
  .then(objectToCamelCaseDeep);
