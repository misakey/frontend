import API from '@misakey/api';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

// BUILDERS
export const requireAuthable = (loginChallenge, identifier) => API
  .use(API.endpoints.identities.checkAuthable)
  .build(null, objectToSnakeCase({ loginChallenge, identifier: { value: identifier } }))
  .send()
  .then((response) => {
    const { identity, authnStep: { metadata, ...rest } } = objectToCamelCase(response);

    return {
      identity: objectToCamelCase(identity),
      authnStep: {
        ...objectToCamelCase(rest),
        metadata,
      },
    };
  });

export const getIdentity = (identityId) => API
  .use(API.endpoints.identities.read)
  .build({ id: identityId })
  .send()
  .then(objectToCamelCase);
