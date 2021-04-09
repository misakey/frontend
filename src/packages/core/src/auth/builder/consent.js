
import API from '@misakey/core/api';

import objectToSnakeCase from '@misakey/core/helpers/objectToSnakeCase';
import objectToCamelCaseDeep from '@misakey/core/helpers/objectToCamelCaseDeep';

export const consent = ({ identityId, consentChallenge, consentedScopes }) => API
  .use(API.endpoints.auth.consent.create)
  .build(null, objectToSnakeCase({
    identityId,
    consentChallenge,
    consentedScopes,
  }))
  .send();


export const getInfo = ({ consentChallenge }) => API
  .use(API.endpoints.auth.consent.info)
  .build(null, null, objectToSnakeCase({ consentChallenge }))
  .send()
  .then(objectToCamelCaseDeep)
  .then(({ context: { mid: identityId }, ...rest }) => {
    const authnState = {
      identityId,
    };
    return {
      authnState,
      ...rest,
    };
  });
