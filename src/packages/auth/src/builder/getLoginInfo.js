import API from '@misakey/api';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCaseDeep from '@misakey/helpers/objectToCamelCaseDeep';


export default (loginChallenge) => API
  .use(API.endpoints.auth.info)
  .build(null, null, objectToSnakeCase({ loginChallenge }))
  .send()
  .then(objectToCamelCaseDeep);
