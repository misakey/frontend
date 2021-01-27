import API from '@misakey/api';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

// BUILDERS
export const getIdentity = (identityId) => API
  .use(API.endpoints.identities.read)
  .build({ id: identityId })
  .send()
  .then(objectToCamelCase);


export const beginWebauthnRegistration = (identityId) => API
  .use(API.endpoints.identities.webauthnCredentials.read)
  .build({ id: identityId })
  .send()
  .then(objectToCamelCase);


export const finishWebauthnRegistration = (identityId, payload) => API
  .use(API.endpoints.identities.webauthnCredentials.create)
  .build({ id: identityId }, payload)
  .send()
  .then(objectToCamelCase);

export const listWebauthnRegistration = (identityId) => API
  .use(API.endpoints.identities.webauthnCredentials.find)
  .build(null, null, objectToSnakeCase({ identityId }))
  .send()
  .then((response) => response.map(objectToCamelCase));

export const deleteWebauthnRegistration = (identityId, id) => API
  .use(API.endpoints.identities.webauthnCredentials.delete)
  .build({ identityId, id })
  .send();
