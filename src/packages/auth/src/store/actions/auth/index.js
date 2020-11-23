import moment from 'moment';

// ACTIONS
export const AUTH_RESET = Symbol('AUTH_RESET');
export const SIGN_IN = Symbol('SIGN_IN');
export const LOAD_USER = Symbol('LOAD_USER');
export const SIGN_OUT = Symbol('SIGN_OUT');
export const UPDATE_IDENTITY = Symbol('UPDATE_IDENTITY');
export const CLEAR_IDENTITY = Symbol('CLEAR_IDENTITY');
export const SET_IS_AUTHENTICATED = Symbol('SET_IS_AUTHENTICATED');

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

export const clearIdentity = () => ({
  type: CLEAR_IDENTITY,
});

export const setIsAuthenticated = (isAuthenticated) => ({
  type: SET_IS_AUTHENTICATED,
  isAuthenticated,
});

// THUNKS
// thunks to ensure async behaviour: store update before promise is fulfilled
export const loadUserThunk = (credentials) => (dispatch) => dispatch(loadUser(credentials));
