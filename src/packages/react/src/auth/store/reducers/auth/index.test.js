import moment from 'moment';
import { SIGN_OUT, AUTH_RESET, UPDATE_IDENTITY, LOAD_USER_INFO } from '../../actions/auth';
import reducer, { INITIAL_STATE } from './index';

describe('testing auth reducer', () => {
  const dirtyState = {
    authenticatedAt: moment().toISOString(),
    identity: {},
    expiresAt: '2020-10-15',
  };
  it('should return initial state', () => {
    expect(reducer(undefined, {})).toEqual(INITIAL_STATE);
  });
  it('should handle AUTH_RESET', () => {
    expect(reducer(dirtyState, { type: AUTH_RESET })).toEqual(INITIAL_STATE);
  });

  describe('LOAD_USER_INFO', () => {
    const user = { scope: 'openid user', identityId: 'test', accountId: 'test', acr: 1 };

    it('should handle LOAD_USER_INFO, initial state', () => {
      expect(reducer(INITIAL_STATE, { type: LOAD_USER_INFO, ...user })).toEqual({
        ...INITIAL_STATE,
        ...user,
        isAuthenticated: false, // because expiresAt is nil
      });
    });

    it('should handle LOAD_USER_INFO, any state with no identity', () => {
      expect(reducer({ expiresAt: '2020-05-20..' }, { type: LOAD_USER_INFO, ...user })).toEqual({
        ...user,
        isAuthenticated: true,
        identity: undefined,
        expiresAt: '2020-05-20..',
      });
    });

    it('should handle LOAD_USER_INFO, any state with same identity', () => {
      expect(reducer({ expiresAt: '2020-05-20..', identity: { id: 'test', displayName: 'jean', accountId: 'test' } }, { type: LOAD_USER_INFO, ...user })).toEqual({
        ...user,
        isAuthenticated: true,
        identity: { id: 'test', displayName: 'jean', accountId: 'test' },
        expiresAt: '2020-05-20..',
      });
    });

    it('should handle LOAD_USER_INFO, state with identity', () => {
      expect(reducer(
        { expiresAt: '2020-05-20..', identity: { id: 'test2', displayName: 'jean' } },
        { type: LOAD_USER_INFO, ...user },
      )).toEqual({
        ...user,
        isAuthenticated: true,
        identity: null,
        expiresAt: '2020-05-20..',
      });
    });

    it('should handle LOAD_USER_INFO, state with account upgrade', () => {
      expect(reducer(
        { expiresAt: '2020-05-20..', identity: { id: 'test', displayName: 'jean', accountId: null, hasAccount: false } },
        { type: LOAD_USER_INFO, ...user },
      )).toEqual({
        ...user,
        isAuthenticated: true,
        identity: { id: 'test', displayName: 'jean', accountId: 'test', hasAccount: true },
        expiresAt: '2020-05-20..',
      });
    });
  });

  it('should handle SIGN_OUT', () => {
    expect(reducer(dirtyState, { type: SIGN_OUT })).toEqual(INITIAL_STATE);
  });

  describe('UPDATE_IDENTITY', () => {
    const identity = {
      name: 'john',
    };

    it('should handle UPDATE_IDENTITY, initial state', () => {
      expect(reducer(INITIAL_STATE, { type: UPDATE_IDENTITY, identity })).toEqual({
        ...INITIAL_STATE,
        identity,
      });
    });

    it('should handle UPDATE_IDENTITY, any state', () => {
      const state = { identity: { name: 'julius', avatar: '' } };
      expect(reducer(state, { type: UPDATE_IDENTITY, identity })).toEqual({
        ...state,
        identity: { ...state.identity, ...identity },
      });
    });
  });
});
