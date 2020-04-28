import API from '@misakey/api';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';


export const getUserBuilder = (id) => API
  .use(API.endpoints.user.read)
  .build({ id })
  .send()
  .then(objectToCamelCase);
