
import API from '@misakey/core/api';

import objectToCamelCaseDeep from '@misakey/core/helpers/objectToCamelCaseDeep';
import objectToSnakeCase from '@misakey/core/helpers/objectToSnakeCase';

export const getSecretStorageFromAuthFlowBuilder = (payload) => API
  .use(API.endpoints.auth.secretStorage.read)
  .build(null, null, objectToSnakeCase(payload))
  .send()
  .then((body) => objectToCamelCaseDeep(body, { ignoreBase64: true }));
