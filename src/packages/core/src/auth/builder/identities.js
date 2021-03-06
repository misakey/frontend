import API from '@misakey/core/api';

import objectToSnakeCase from '@misakey/core/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/core/helpers/objectToCamelCase';

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


export const beginTotpEnroll = (identityId) => API
  .use(API.endpoints.identities.totp.read)
  .build({ id: identityId })
  .send()
  .then(objectToCamelCase);


export const finishTotpEnroll = (identityId, payload) => API
  .use(API.endpoints.identities.totp.create)
  .build({ id: identityId }, payload)
  .send()
  .then(objectToCamelCase);

export const deleteTotpConfiguration = (identityId) => API
  .use(API.endpoints.identities.totp.delete)
  .build({ id: identityId })
  .send();

export const resetTotpRecoveryCodes = (identityId) => API
  .use(API.endpoints.identities.totp.recoveryCodes.create)
  .build({ id: identityId })
  .send()
  .then(objectToCamelCase);
