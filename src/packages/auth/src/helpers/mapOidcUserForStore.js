import { parseAcr } from '@misakey/helpers/parseAcr';
import parseJwt from '@misakey/helpers/parseJwt';

export default ({
  profile: { acr, sco: scope, auth_time: authenticatedAt, csrf_token: token } = {},
  expires_at: expiresAt,
  id_token: id,
}) => {
  const { mid: identityId, aid: accountId } = parseJwt(id);

  return {
    expiresAt,
    token,
    id,
    authenticatedAt,
    scope,
    isAuthenticated: !!token,
    acr: parseAcr(acr),
    identityId,
    accountId,
  };
};
