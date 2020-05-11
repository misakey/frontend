import createResetOnSignOutReducer from '@misakey/auth/store/reducers/helpers/createResetOnSignOutReducer';
import { createSelector } from 'reselect';

import merge from '@misakey/helpers/merge';
import isNil from '@misakey/helpers/isNil';

import {
  AUTH_RESET,
  LOAD_USER,
  SIGN_IN,
  UPDATE_PROFILE,
  LOAD_USER_ROLES,
  ADD_USER_ROLE,
} from '../../actions/auth';


// HELPERS
const mergeProfile = (state, profile) => (isNil(profile)
  ? state.profile
  : merge({}, state.profile, profile)
);

// INITIAL_STATE
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

function updateProfile(state, { profile }) {
  return {
    ...state,
    profile: mergeProfile(state, profile),
  };
}

function updateCredentials(state, { credentials: { profile, ...rest } }) {
  return {
    ...state,
    profile: mergeProfile(state, profile),
    ...rest,
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


// SELECTORS
export const getCurrentUserSelector = createSelector(
  (state) => state.auth,
  (items) => items.profile,
);

// REDUCER
export default createResetOnSignOutReducer(INITIAL_STATE, {
  [AUTH_RESET]: resetCredentials,
  [SIGN_IN]: updateCredentials,
  [LOAD_USER]: updateCredentials,
  [UPDATE_PROFILE]: updateProfile,
  [LOAD_USER_ROLES]: updateRoles,
  [ADD_USER_ROLE]: addUserRole,
});
