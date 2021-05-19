
import API from '@misakey/core/api';

import objectToSnakeCase from '@misakey/core/helpers/objectToSnakeCase';
import objectToSnakeCaseDeep from '@misakey/core/helpers/objectToSnakeCaseDeep';
import objectToCamelCaseDeep from '@misakey/core/helpers/objectToCamelCaseDeep';
// import datatags from '@misakey/core/api/API/endpoints/mocks/consent/datatags';
// import tospp from '@misakey/core/api/API/endpoints/mocks/consent/tospp';

// HELPERS
const remapConsentInfo = ({ context, subjectIdentity, ...rest }) => {
  const { mid: identityId } = context;
  const authnState = {
    identityId,
  };
  return {
    authnState,
    ...context,
    subjectIdentity,
    ...rest,
  };
};

export const consent = ({ acr, subjectIdentityId, consentChallenge, consentedScopes }) => API
  .use(API.endpoints.auth.consent.create)
  .build(null, objectToSnakeCaseDeep(
    {
      acr,
      subjectIdentityId,
      consentChallenge,
      consentedScopes,
    },
    { ignoreDotted: true },
  ))
  .send();


export const getInfo = ({ consentChallenge }) => API
  .use(API.endpoints.auth.consent.info)
  .build(null, null, objectToSnakeCase({ consentChallenge }))
  .send()
  .then(objectToCamelCaseDeep)
  .then(remapConsentInfo);

// export const getInfo = () => {
//   const response = objectToCamelCaseDeep(datatags);
//   const remapped = remapConsentInfo(response);
//   return Promise.resolve(remapped);
// };
