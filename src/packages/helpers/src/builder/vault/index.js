import API from '@misakey/api';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

export const countSavedFilesBuilder = (queryParams = {}) => API
  .use(API.endpoints.user.vault.files.count)
  .build(null, null, objectToSnakeCase(queryParams))
  .send()
  .then((response) => parseInt(response.headers.get('X-Total-Count'), 10));

export const getSavedFilesBuilder = (queryParams = {}) => API
  .use(API.endpoints.user.vault.files.read)
  .build(null, null, objectToSnakeCase(queryParams))
  .send()
  .then((response) => response.map(objectToCamelCase));

export const createSavedFile = (payload) => API
  .use(API.endpoints.user.vault.files.create)
  .build(null, objectToSnakeCase(payload))
  .send()
  .then(objectToCamelCase);

export const deleteSavedFileBuilder = (id) => API
  .use(API.endpoints.user.vault.files.delete)
  .build({ id })
  .send();
