import { EMAILED_CODE, PREHASHED_PASSWORD } from '@misakey/core/auth/constants/method';
import { SSO_RESET, SSO_UPDATE } from '../../actions/sso';

import reducer, { INITIAL_STATE } from '.';

describe('testing sso reducer', () => {
  const ACR = 18;
  const dirtyState = {
    client: {
      id: 'zefkrtlledz128',
      name: 'test',
      logoUri: 'drktrfkefv',
    },
    identity: {
      displayName: 'Test',
      avatarUrl: 'zdfrgt',
    },
    authnStep: {
      identityId: 'ertfedezr',
      methodName: EMAILED_CODE,
    },
    loginChallenge: 'defrthdr',
    loginHint: '',
    scope: ['openid'],
    acr: ACR,
    acrValues: [ACR.toString()],
  };
  it('should return initial state', () => {
    expect(reducer(undefined, {})).toEqual(INITIAL_STATE);
  });
  describe('SSO_RESET', () => {
    it('should return initial state, initial state', () => {
      expect(reducer(INITIAL_STATE, { type: SSO_RESET })).toEqual(INITIAL_STATE);
    });
    it('should return initial state, dirty state', () => {
      expect(reducer(dirtyState, { type: SSO_RESET })).toEqual(INITIAL_STATE);
    });
  });

  describe('SSO_UPDATE', () => {
    const OTHER_ACR = 32;
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
      acrValues: [OTHER_ACR.toString()],
    };

    it('should store acr', () => {
      expect(reducer(INITIAL_STATE, { type: SSO_UPDATE, sso: payload }))
        .toEqual(expect.objectContaining({
          acr: OTHER_ACR,
        }));
    });

    it('should return next state, initial state', () => {
      const expected = {
        ...INITIAL_STATE,
        ...payload,
        acr: OTHER_ACR,
      };
      expect(reducer(INITIAL_STATE, { type: SSO_UPDATE, sso: payload })).toEqual(expected);
    });

    it('should return next state, dirty state', () => {
      const expected = {
        ...dirtyState,
        ...payload,
        acr: OTHER_ACR,
      };
      expect(reducer(dirtyState, { type: SSO_UPDATE, sso: payload })).toEqual(expected);
    });
  });
});
