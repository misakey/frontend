import API from '@misakey/api';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

export const getRolesBuilder = (query) => API
  .use(API.endpoints.user.roles.read)
  .build(null, null, objectToSnakeCase(query))
  .send()
  .then((response) => response.map(objectToCamelCase));
