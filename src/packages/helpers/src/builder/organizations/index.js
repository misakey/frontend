import API from '@misakey/api';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

export const createOrganizationBuilder = (payload) => API
  .use(API.endpoints.organizations.create)
  .build(null, objectToSnakeCase(payload))
  .send()
  .then(objectToCamelCase);

export const getOrgPublicBuilder = (id) => API
  .use(API.endpoints.organizations.public.read)
  .build({ id })
  .send()
  .then(objectToCamelCase);
