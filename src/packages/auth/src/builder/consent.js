
import API from '@misakey/api';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

export default ({ identityId, consentChallenge, consentedScopes }) => API
  .use(API.endpoints.auth.consent)
  .build(null, objectToSnakeCase({
    identityId,
    consentChallenge,
    consentedScopes,
  }))
  .send();
