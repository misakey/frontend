import API from '@misakey/core/api';

import objectToSnakeCase from '@misakey/core/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/core/helpers/objectToCamelCase';
import objectToCamelCaseDeep from '@misakey/core/helpers/objectToCamelCaseDeep';
import objectToSnakeCaseDeep from '@misakey/core/helpers/objectToSnakeCaseDeep';
import toFormData from '@misakey/core/helpers/toFormData';

export const updateIdentity = ({ id, ...payload }) => API
  .use(API.endpoints.identities.update)
  .build({ id }, objectToSnakeCase(payload))
  .send();

export const uploadAvatar = ({ id, avatar }) => API
  .use(API.endpoints.identities.avatar.update)
  .build({ id }, toFormData(avatar))
  .send({ contentType: null });

export const getProfile = ({ identityId, isAuthenticated }) => API
  .use({ ...API.endpoints.identities.profile.read, auth: isAuthenticated })
  .build({ id: identityId })
  .send()
  .then(objectToCamelCase);

export const getProfileConfig = ({ identityId }) => API
  .use(API.endpoints.identities.profile.config.read)
  .build({ id: identityId })
  .send()
  .then(objectToCamelCase);

export const updateProfileConfig = ({ identityId, ...payload }) => API
  .use(API.endpoints.identities.profile.config.update)
  .build({ id: identityId }, objectToSnakeCase(payload))
  .send();

export const listStorageQuota = (id) => API
  .use(API.endpoints.identities.storageQuota.find)
  .build({ id })
  .send()
  .then((response) => response.map(objectToCamelCase));

export const listBoxUsedSpaces = (payload) => API
  .use(API.endpoints.identities.boxUsedSpaces.find)
  .build(null, null, objectToSnakeCase(payload))
  .send()
  .then((response) => response.map(objectToCamelCase));

export const readVaultUsedSpace = (id) => API
  .use(API.endpoints.identities.vaultUsedSpace.read)
  .build({ id })
  .send()
  .then(objectToCamelCase);

export const updateBoxSettings = (identityId, boxId, payload) => API
  .use(API.endpoints.identities.boxSettings.update)
  .build({ identityId, boxId }, objectToSnakeCase(payload))
  .send()
  .then(objectToCamelCase);

export const getUserNotificationsBuilder = (id, queryParams = {}) => API
  .use(API.endpoints.identities.notifications.find)
  .build({ id }, null, objectToSnakeCase(queryParams))
  .send()
  .then((events) => events.map(objectToCamelCaseDeep));

export const countUserNotificationsBuilder = (id, queryParams = {}) => API
  .use(API.endpoints.identities.notifications.count)
  .build({ id }, null, objectToSnakeCase(queryParams))
  .send()
  .then((response) => parseInt(response.headers.get('X-Total-Count'), 10));

export const acknowledgeUserNotificationsBuilder = (id, queryParams = {}) => API
  .use(API.endpoints.identities.notifications.update)
  .build({ id }, null, objectToSnakeCase(queryParams))
  .send();

export const contactUserBuilder = (identityId, payload) => API
  .use(API.endpoints.identities.contact.create)
  .build({ identityId }, objectToSnakeCaseDeep(payload, { ignoreBase64: true }))
  .send()
  .then(objectToCamelCase);

export const listOrganizations = (identityId) => API
  .use(API.endpoints.identities.organizations.find)
  .build({ id: identityId })
  .send()
  .then((response) => response.map(objectToCamelCase));

export const listDatatags = (identityId, queryParams = {}) => API
  .use(API.endpoints.identities.datatags.find)
  .build({ id: identityId }, null, objectToSnakeCase(queryParams))
  .send()
  .then((response) => response.map(objectToCamelCase));
