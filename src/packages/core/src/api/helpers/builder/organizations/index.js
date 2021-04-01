import API from '@misakey/core/api';

import objectToCamelCase from '@misakey/core/helpers/objectToCamelCase';
import objectToCamelCaseDeep from '@misakey/core/helpers/objectToCamelCaseDeep';
import objectToSnakeCase from '@misakey/core/helpers/objectToSnakeCase';

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

export const generateOrganizationSecretBuilder = (id) => API
  .use(API.endpoints.organizations.secret.create)
  .build({ id })
  .send()
  .then(objectToCamelCase);

export const countOrganizationAgents = (id, queryParams) => API
  .use(API.endpoints.organizations.agents.count)
  .build({ id }, null, objectToSnakeCase(queryParams))
  .send()
  .then((response) => parseInt(response.headers.get('X-Total-Count'), 10));

export const listOrganizationAgents = (id, queryParams) => API
  .use(API.endpoints.organizations.agents.find)
  .build({ id }, null, objectToSnakeCase(queryParams))
  .send()
  .then((response) => response
    .map(({ id: agentId, ...rest }) => ({
      id: agentId.toString(),
      ...objectToCamelCaseDeep(rest),
    })));

export const addOrganizationAgent = (id, agent) => API
  .use(API.endpoints.organizations.agents.create)
  .build({ id }, { email: agent })
  .send()
  .then(({ id: agentId, ...rest }) => ({ id: agentId.toString(), ...objectToCamelCaseDeep(rest) }));
