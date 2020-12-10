import { parseAcr } from '@misakey/helpers/parseAcr';
import parseJwt from '@misakey/helpers/parseJwt';

export default ({
  profile: { acr, sco: scope, auth_time: authenticatedAt } = {},
  expires_at: expiresAt,
  id_token: id,
}) => {
  const { mid: identityId, aid: accountId } = parseJwt(id);

  return {
    expiresAt,
    id,
    authenticatedAt,
    scope,
    isAuthenticated: true,
    acr: parseAcr(acr),
    identityId,
    accountId,
  };
};
