import moment from 'moment';
import { SIGN_IN, SIGN_OUT, AUTH_RESET, UPDATE_PROFILE, LOAD_USER, LOAD_USER_ROLES } from '../../actions/auth';
import reducer, { INITIAL_STATE } from './index';

describe('testing auth reducer', () => {
  const dirtyState = {
    id: '226',
    authenticatedAt: moment().toISOString(),
    profile: {},
    token: '152852sdfr.efrgt.dre',
    expiresAt: '2020-10-15',
  };
  it('should return initial state', () => {
    expect(reducer(undefined, {})).toEqual(INITIAL_STATE);
  });
  it('should handle AUTH_RESET', () => {
    expect(reducer(dirtyState, { type: AUTH_RESET })).toEqual(INITIAL_STATE);
  });
  describe('SIGN_IN', () => {
    const credentials = { token: 'hey', id: 'ho' };

    it('should handle SIGN_IN, initial state', () => {
      expect(reducer(INITIAL_STATE, { type: SIGN_IN, credentials })).toEqual({
        ...INITIAL_STATE,
        ...credentials,
      });
    });

    it('should handle SIGN_IN, any state', () => {
      expect(reducer({}, { type: SIGN_IN, credentials })).toEqual({
        ...credentials,
      });
    });
  });

  describe('LOAD_USER', () => {
    const credentials = { token: 'hey', id: 'ho', authenticatedAt: 'date' };

    it('should handle LOAD_USER, initial state', () => {
      expect(reducer(INITIAL_STATE, { type: LOAD_USER, credentials })).toEqual({
        ...INITIAL_STATE,
        ...credentials,
      });
    });

    it('should handle LOAD_USER, any state', () => {
      expect(reducer({}, { type: LOAD_USER, credentials })).toEqual({
        ...credentials,
      });
    });
  });

  it('should handle SIGN_OUT', () => {
    expect(reducer(dirtyState, { type: SIGN_OUT })).toEqual(INITIAL_STATE);
  });

  describe('UPDATE_PROFILE', () => {
    const profile = {
      name: 'john',
    };

    it('should handle UPDATE_PROFILE, initial state', () => {
      expect(reducer(INITIAL_STATE, { type: UPDATE_PROFILE, profile })).toEqual({
        ...INITIAL_STATE,
        profile,
      });
    });

    it('should handle UPDATE_PROFILE, any state', () => {
      const state = { profile: { name: 'julius', avatar: '' } };
      expect(reducer(state, { type: UPDATE_PROFILE, profile })).toEqual({
        ...state,
        profile: { ...state.profile, ...profile },
      });
    });
  });

  describe('LOAD_USER_ROLES', () => {
    const roles = [
      {
        roleLabel: 'dpo',
        applicationId: '8b88d48-ad48-43b9-a323-eab1de68b280',
        userId: '54rfde2-ad48-43b9-a323-iyhk7868b280',
      },
    ];

    it('should handle LOAD_USER_ROLES, initial state', () => {
      expect(reducer(INITIAL_STATE, { type: LOAD_USER_ROLES, roles })).toEqual({
        ...INITIAL_STATE,
        roles,
      });
    });

    it('should handle LOAD_USER_ROLES, any state', () => {
      const state = {
        roles: [
          {
            roleLabel: 'admin',
            applicationId: '8b88d48-ad48-43b9-a323-eab1de68b280',
            userId: '54rfde2-ad48-43b9-a323-iyhk7868b280',
          },
        ],
      };
      expect(reducer(state, { type: LOAD_USER_ROLES, roles })).toEqual({
        ...state,
        roles,
      });
    });
  });
});
