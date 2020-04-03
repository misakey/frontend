import moment from 'moment';

export const AUTH_RESET = 'AUTH_RESET';
export const SIGN_IN = 'SIGN_IN';
export const LOAD_USER = 'LOAD_USER';
export const SIGN_OUT = 'SIGN_OUT';
export const UPDATE_PROFILE = 'UPDATE_PROFILE';
export const LOAD_USER_ROLES = 'LOAD_USER_ROLES';
export const ADD_USER_ROLE = 'ADD_USER_ROLE';

export const authReset = () => ({
  type: AUTH_RESET,
});

export const signIn = (credentials) => ({
  type: SIGN_IN,
  credentials: {
    ...credentials,
    authenticatedAt: moment().toISOString(),
  },
});

export const loadUser = (credentials) => ({
  type: LOAD_USER,
  credentials,
});

export const signOut = () => ({
  type: SIGN_OUT,
});

export const updateProfile = (profile) => ({
  type: UPDATE_PROFILE,
  profile,
});

export const loadUserRoles = (roles) => ({
  type: LOAD_USER_ROLES,
  roles,
});

export const addRoleToUser = (role) => ({
  type: ADD_USER_ROLE,
  role,
});
