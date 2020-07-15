import API from '@misakey/api';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import hashPassword from '../passwordHashing/hashPassword';
import genParams from '../passwordHashing/genParams';

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

export const createAccount = async ({
  password,
  identityId,
  dispatchHardPasswordChange,
}) => {
  const [
    { backupData, backupKey },
    prehashedPassword,
  ] = await Promise.all([
    dispatchHardPasswordChange(password),
    hashPassword({ password, pwdHashParams: genParams() }),
  ]);

  // prehashed password is not deeply snakecased
  // because "snake case" helper does not work well on it
  // ("base64" is turned into "base_64")
  const payload = objectToSnakeCase({
    prehashedPassword,
    backupData,
  });

  return API
    .use(API.endpoints.identities.account.create)
    .build({ id: identityId }, payload)
    .send()
    .then((response) => ({ ...objectToCamelCase(response), backupKey }));
};
