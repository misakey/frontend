import API from '@misakey/api';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

// BUILDERS
export const getIdentity = (identityId) => API
  .use(API.endpoints.identities.read)
  .build({ id: identityId })
  .send()
  .then(objectToCamelCase);
