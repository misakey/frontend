import moment from 'moment';

export const AUTH_RESET = 'AUTH_RESET';
export const SIGN_IN = 'SIGN_IN';
export const SIGN_OUT = 'SIGN_OUT';

export const authReset = () => ({
  type: AUTH_RESET,
});

export const signIn = credentials => ({
  type: SIGN_IN,
  ...credentials,
  authenticatedAt: moment().toISOString(),
});

export const signOut = () => ({
  type: SIGN_OUT,
});
