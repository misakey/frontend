import API from '@misakey/api';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCaseDeep from '@misakey/helpers/objectToCamelCaseDeep';


export default (loginChallenge, identifier) => API
  .use(API.endpoints.auth.checkAuthable)
  .build(null, objectToSnakeCase({ loginChallenge, identifier: { value: identifier } }))
  .send()
  .then(objectToCamelCaseDeep);
