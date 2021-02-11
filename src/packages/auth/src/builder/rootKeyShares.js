
import API from '@misakey/api';

import objectToCamelCaseDeep from '@misakey/helpers/objectToCamelCaseDeep';
import objectToSnakeCaseDeep from '@misakey/helpers/objectToSnakeCaseDeep';

export const createRootKeyShareBuilder = (misakeyKeyShare) => API
  .use(API.endpoints.user.rootKeyShares.create)
  .build(null, objectToSnakeCaseDeep(misakeyKeyShare))
  .send()
  .then(objectToCamelCaseDeep);

export const createRootKeyShareFromAuthFlowBuilder = (accessToken, misakeyKeyShare) => API
  .use(API.endpoints.auth.rootKeyShares.create)
  .build(null, objectToSnakeCaseDeep(misakeyKeyShare))
  .send({ headers: { Authorization: `Bearer ${accessToken}` } })
  .then(objectToCamelCaseDeep);

export const getRootKeyShareBuilder = (otherShareHash) => API
  .use(API.endpoints.user.rootKeyShares.read)
  .build({ otherShareHash })
  .send()
  .then(objectToCamelCaseDeep);
