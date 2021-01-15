import API from '@misakey/api';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

export default (loginChallenge, identifier) => API
  .use(API.endpoints.auth.identities.update)
  .build(null, objectToSnakeCase({ loginChallenge, identifierValue: identifier }))
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
