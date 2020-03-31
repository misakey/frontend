import createReducer from '@misakey/store/reducers/helpers/createReducer';

import merge from '@misakey/helpers/merge';

import {
  AUTH_RESET,
  LOAD_USER,
  SIGN_OUT,
  SIGN_IN,
  UPDATE_PROFILE,
  LOAD_USER_ROLES,
  ADD_USER_ROLE,
} from '../../actions/auth';


export const INITIAL_STATE = {
  id: null,
  authenticatedAt: null,
  isAuthenticated: null,
  profile: null,
  roles: null,
  token: null,
  expiresAt: null,
  userId: null,
  acr: null,
  scope: null,
};

function resetCredentials() {
  return INITIAL_STATE;
}

function updateCredentials(state, { type, ...rest }) {
  return merge({}, state, rest);
}

function updateProfile(state, { profile }) {
  return {
    ...state,
    profile: merge({}, state.profile, profile),
  };
}

function updateRoles(state, { roles }) {
  return {
    ...state,
    roles,
  };
}

function addUserRole(state, { role }) {
  return {
    ...state,
    roles: [...state.roles, role],
  };
}

export default createReducer(INITIAL_STATE, {
  [SIGN_OUT]: resetCredentials,
  [AUTH_RESET]: resetCredentials,
  [SIGN_IN]: updateCredentials,
  [LOAD_USER]: updateCredentials,
  [UPDATE_PROFILE]: updateProfile,
  [LOAD_USER_ROLES]: updateRoles,
  [ADD_USER_ROLE]: addUserRole,
});
