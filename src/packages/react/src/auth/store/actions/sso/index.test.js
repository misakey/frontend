
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
      const ACR = 2;
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
        authnState: {
          availableAmrs: ['identity:emailed_code', 'identity:prehashed_password', 'totp:totp', 'totp:recovery'],
          currentAcr: '0',
          currentAmrs: [],
          requiredAcr: '2',
        },
        loginChallenge: 'dsfopkzklf',
        displayHints: { resourceName: 'test' },
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
