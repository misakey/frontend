import {
  AUTH_RESET, LOAD_USER_INFO, SIGN_OUT, UPDATE_IDENTITY,
  authReset, loadUser, signOut, updateIdentity,
  loadUserThunk,
} from './index';

describe('testing auth actions', () => {
  describe('action creators', () => {
    it('should create an AUTH_RESET action', () => {
      expect(authReset()).toEqual({ type: AUTH_RESET });
    });
    it('should create a LOAD_USER_INFO action', () => {
      const user = { scope: 'openid user', accountId: 'test', identityId: 'test' };
      expect(loadUser(user)).toEqual({
        type: LOAD_USER_INFO,
        ...user,
      });
    });
    it('should create a SIGN_OUT action', () => {
      expect(signOut()).toEqual({ type: SIGN_OUT });
    });

    it('should create a UPDATE_IDENTITY action', () => {
      const identity = {
        displayName: 'john',
      };
      expect(updateIdentity(identity)).toEqual({ type: UPDATE_IDENTITY, identity });
    });
  });

  describe('thunks', () => {
    const dispatchMock = (...args) => Promise.resolve(...args);

    it('should create a LOAD_USER_INFO thunk', async () => {
      const user = { scope: 'openid user', accountId: 'test', identityId: 'test' };

      const thunk = loadUserThunk(user);
      expect.assertions(1);
      await expect(thunk(dispatchMock)).resolves.toEqual({
        type: LOAD_USER_INFO,
        ...user,
      });
    });
  });
});
