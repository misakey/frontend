import API from '@misakey/api';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

export const getBackupFromAuthFlowBuilder = (payload) => API
  .use(API.endpoints.auth.backup.read)
  .build(null, null, objectToSnakeCase(payload))
  .send()
  .then(objectToCamelCase);
