
import API from '@misakey/api';

import objectToCamelCaseDeep from '@misakey/helpers/objectToCamelCaseDeep';
import objectToSnakeCaseDeep from '@misakey/helpers/objectToSnakeCaseDeep';

export const createBackupKeyShareBuilder = (misakeyKeyShare) => API
  .use(API.endpoints.user.backupKeyShares.create)
  .build(null, objectToSnakeCaseDeep(misakeyKeyShare))
  .send()
  .then(objectToCamelCaseDeep);

export const createBackupKeyShareFromAuthFlowBuilder = (misakeyKeyShare) => API
  .use(API.endpoints.auth.backupKeyShares.create)
  .build(null, objectToSnakeCaseDeep(misakeyKeyShare))
  .send()
  .then(objectToCamelCaseDeep);

export const getBackupKeyShareBuilder = (otherShareHash) => API
  .use(API.endpoints.user.backupKeyShares.read)
  .build({ otherShareHash })
  .send()
  .then(objectToCamelCaseDeep);
