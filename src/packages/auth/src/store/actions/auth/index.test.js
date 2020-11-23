import {
  AUTH_RESET, LOAD_USER, SIGN_IN, SIGN_OUT, UPDATE_IDENTITY,
  authReset, loadUser, signIn, signOut, updateIdentity,
  loadUserThunk,
} from './index';

describe('testing auth actions', () => {
  describe('action creators', () => {
    it('should create an AUTH_RESET action', () => {
      expect(authReset()).toEqual({ type: AUTH_RESET });
    });
    it('should create a SIGN_IN action', () => {
      const credentials = { token: 'hey', id: 'ho' };
      expect(signIn(credentials)).toEqual({
        type: SIGN_IN,
        credentials: {
          ...credentials,
          authenticatedAt: expect.any(String),
        },
      });
    });
    it('should create a LOAD_USER action', () => {
      const credentials = { token: 'hey', id: 'ho', authenticatedAt: 'date' };
      expect(loadUser(credentials)).toEqual({
        type: LOAD_USER,
        credentials,
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

    it('should create a LOAD_USER thunk', async () => {
      const credentials = { token: 'hey', id: 'ho', authenticatedAt: 'date' };

      const thunk = loadUserThunk(credentials);
      expect.assertions(1);
      await expect(thunk(dispatchMock)).resolves.toEqual({
        type: LOAD_USER,
        credentials,
      });
    });
  });
});
