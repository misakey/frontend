
import API from '@misakey/api';

import objectToCamelCaseDeep from '@misakey/helpers/objectToCamelCaseDeep';
import objectToSnakeCaseDeep from '@misakey/helpers/objectToSnakeCaseDeep';

export const createRootKeyShareBuilder = (misakeyKeyShare) => API
  .use(API.endpoints.user.rootKeyShares.create)
  .build(null, objectToSnakeCaseDeep(misakeyKeyShare))
  .send()
  .then(objectToCamelCaseDeep);

export const createRootKeyShareFromAuthFlowBuilder = (misakeyKeyShare) => API
  .use(API.endpoints.auth.rootKeyShares.create)
  .build(null, objectToSnakeCaseDeep(misakeyKeyShare))
  .send()
  .then(objectToCamelCaseDeep);

export const getRootKeyShareBuilder = (userLocalShareHash) => API
  .use(API.endpoints.user.rootKeyShares.read)
  .build({ userLocalShareHash })
  .send()
  .then(objectToCamelCaseDeep);
