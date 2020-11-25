import moment from 'moment';
import { SIGN_IN, SIGN_OUT, AUTH_RESET, UPDATE_IDENTITY, LOAD_USER } from '../../actions/auth';
import reducer, { INITIAL_STATE } from './index';

describe('testing auth reducer', () => {
  const dirtyState = {
    id: '226',
    authenticatedAt: moment().toISOString(),
    identity: {},
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
    const credentials = { token: 'hey', id: 'ho', identity: { id: 'letsgo' }, authenticatedAt: 'date', acr: 1 };

    it('should handle SIGN_IN, initial state', () => {
      expect(reducer(INITIAL_STATE, { type: SIGN_IN, credentials })).toEqual({
        ...INITIAL_STATE,
        ...credentials,
      });
    });

    it('should handle SIGN_IN, any state', () => {
      expect(reducer({
        token: 'mytoken',
        identity: { id: 'id', displayName: 'test' },
      }, { type: SIGN_IN, credentials })).toEqual({
        ...INITIAL_STATE,
        ...credentials,
      });
    });
  });

  describe('LOAD_USER', () => {
    const credentials = { token: 'hey', id: 'ho', identity: { id: 'letsgo' }, authenticatedAt: 'date', acr: 1 };

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
