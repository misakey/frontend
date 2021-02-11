
import API from '@misakey/api';

import objectToCamelCaseDeep from '@misakey/helpers/objectToCamelCaseDeep';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

export const getSecretStorageFromAuthFlowBuilder = (payload, accessToken) => API
  .use(API.endpoints.auth.secretStorage.read)
  .build(null, null, objectToSnakeCase(payload))
  .send({ headers: { Authorization: `Bearer ${accessToken}` } })
  .then((body) => objectToCamelCaseDeep(body, { ignoreBase64: true }));
