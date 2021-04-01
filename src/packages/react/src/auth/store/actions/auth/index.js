// ACTIONS
export const AUTH_RESET = Symbol('AUTH_RESET');
export const LOAD_USER_INFO = Symbol('LOAD_USER_INFO');
export const SET_EXPIRES_AT = Symbol('SET_EXPIRES_AT');
export const SIGN_OUT = Symbol('SIGN_OUT');
export const UPDATE_IDENTITY = Symbol('UPDATE_IDENTITY');
export const CLEAR_IDENTITY = Symbol('CLEAR_IDENTITY');
export const SET_IS_AUTHENTICATED = Symbol('SET_IS_AUTHENTICATED');

// ACTION CREATORS
export const authReset = () => ({
  type: AUTH_RESET,
});

export const loadUser = (user) => ({
  type: LOAD_USER_INFO,
  ...user,
});

export const setExpiresAt = (expiresAt) => ({
  type: SET_EXPIRES_AT,
  expiresAt,
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
export const loadUserThunk = (user) => (dispatch) => dispatch(loadUser(user));
