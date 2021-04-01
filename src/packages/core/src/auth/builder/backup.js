import API from '@misakey/core/api';

import objectToCamelCase from '@misakey/core/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/core/helpers/objectToSnakeCase';

export const getBackupFromAuthFlowBuilder = (payload) => API
  .use(API.endpoints.auth.backup.read)
  .build(null, null, objectToSnakeCase(payload))
  .send()
  .then(objectToCamelCase);
