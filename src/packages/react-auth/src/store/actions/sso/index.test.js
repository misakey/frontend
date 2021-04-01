import { PREHASHED_PASSWORD } from '@misakey/core/auth/constants/method';

import {
  SSO_RESET, SSO_UPDATE,
  ssoReset, ssoUpdate,
} from '.';

describe('testing sso actions', () => {
  describe('action creators', () => {
    it('should create an SSO_RESET action', () => {
      expect(ssoReset()).toEqual({ type: SSO_RESET });
    });
    it('should create an SSO_UPDATE action', () => {
      const ACR = 88;
      const payload = {
        client: {
          id: 'efrthykol',
          name: 'toto',
          logoUri: 'defjrttoto',
        },
        identity: {
          displayName: 't0t0',
          avatarUrl: 'efgkh',
        },
        authnStep: {
          identityId: 'djifdrelktjklfs',
          methodName: PREHASHED_PASSWORD,
        },
        loginChallenge: 'dsfopkzklf',
        loginHint: '',
        scope: ['openid'],
        acrValues: [ACR.toString()],
      };

      expect(ssoUpdate(payload)).toEqual({
        type: SSO_UPDATE,
        sso: payload,
      });
    });
  });
});
