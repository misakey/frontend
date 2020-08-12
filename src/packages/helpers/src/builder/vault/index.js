import API from '@misakey/api';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

export const getSavedFiles = (queryParams = {}) => API
  .use(API.endpoints.user.vault.files.read)
  .build(null, null, objectToSnakeCase(queryParams))
  .send()
  .then((response) => response.map(objectToCamelCase));

export const createSavedFile = (payload) => API
  .use(API.endpoints.user.vault.files.create)
  .build(null, objectToSnakeCase(payload))
  .send()
  .then(objectToCamelCase);

export const deleteSavedFile = (id) => API
  .use(API.endpoints.user.vault.files.delete)
  .build({ id })
  .send();
