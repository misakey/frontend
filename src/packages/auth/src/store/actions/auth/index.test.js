import {
  AUTH_RESET, LOAD_USER, SIGN_IN, SIGN_OUT, UPDATE_PROFILE, LOAD_USER_ROLES,
  authReset, loadUser, signIn, signOut, updateProfile, loadUserRoles,
} from './index';

describe('testing auth actions', () => {
  it('should create an AUTH_RESET action', () => {
    expect(authReset()).toEqual({ type: AUTH_RESET });
  });
  it('should create a SIGN_IN action', () => {
    const credentials = { token: 'hey', id: 'ho' };
    expect(signIn(credentials)).toEqual({
      type: SIGN_IN,
      ...credentials,
      authenticatedAt: expect.any(String),
    });
  });
  it('should create a LOAD_USER action', () => {
    const credentials = { token: 'hey', id: 'ho', authenticatedAt: 'date' };
    expect(loadUser(credentials)).toEqual({
      type: LOAD_USER,
      ...credentials,
    });
  });
  it('should create a SIGN_OUT action', () => {
    expect(signOut()).toEqual({ type: SIGN_OUT });
  });

  it('should create a UPDATE_PROFILE action', () => {
    const profile = {
      name: 'john',
    };
    expect(updateProfile(profile)).toEqual({ type: UPDATE_PROFILE, profile });
  });

  it('should LOAD_USER_ROLES action', () => {
    const roles = [
      {
        roleLabel: 'dpo',
        applicationId: '8b88d48-ad48-43b9-a323-eab1de68b280',
        userId: '54rfde2-ad48-43b9-a323-iyhk7868b280',
      },
    ];
    expect(loadUserRoles(roles)).toEqual({ type: LOAD_USER_ROLES, roles });
  });
});
