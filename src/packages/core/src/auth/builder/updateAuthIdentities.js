import API from '@misakey/core/api';

import objectToSnakeCase from '@misakey/core/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/core/helpers/objectToCamelCase';

export default (payload) => API
  .use(API.endpoints.auth.identities.update)
  .build(null, objectToSnakeCase(payload))
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
