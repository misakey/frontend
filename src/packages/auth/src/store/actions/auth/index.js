import moment from 'moment';

// ACTIONS
export const AUTH_RESET = Symbol('AUTH_RESET');
export const SIGN_IN = Symbol('SIGN_IN');
export const LOAD_USER = Symbol('LOAD_USER');
export const SIGN_OUT = Symbol('SIGN_OUT');
export const UPDATE_IDENTITY = Symbol('UPDATE_IDENTITY');
export const LOAD_USER_ROLES = Symbol('LOAD_USER_ROLES');
export const ADD_USER_ROLE = Symbol('ADD_USER_ROLE');

// ACTION CREATORS
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

export const updateIdentity = (identity) => ({
  type: UPDATE_IDENTITY,
  identity,
});

export const loadUserRoles = (roles) => ({
  type: LOAD_USER_ROLES,
  roles,
});

export const addRoleToUser = (role) => ({
  type: ADD_USER_ROLE,
  role,
});

// THUNKS
// thunks to ensure async behaviour: store update before promise is fulfilled
export const loadUserThunk = (credentials) => (dispatch) => dispatch(loadUser(credentials));
export const loadUserRolesThunk = (roles) => (dispatch) => dispatch(loadUserRoles(roles));
