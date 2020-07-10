import createResetOnSignOutReducer from '@misakey/auth/store/reducers/helpers/createResetOnSignOutReducer';
import { createSelector } from 'reselect';

import merge from '@misakey/helpers/merge';
import isNil from '@misakey/helpers/isNil';
import prop from '@misakey/helpers/prop';

import {
  AUTH_RESET,
  LOAD_USER,
  SIGN_IN,
  UPDATE_IDENTITY,
  LOAD_USER_ROLES,
  ADD_USER_ROLE,
} from '../../actions/auth';


// HELPERS
const mergeIdentity = (state, identity) => (isNil(identity)
  ? (state.identity)
  : merge({}, (state.identity || {}), identity)
);

// INITIAL_STATE
export const INITIAL_STATE = {
  id: null,
  authenticatedAt: null,
  isAuthenticated: null,
  identityId: null,
  identity: null,
  roles: null,
  token: null,
  expiresAt: null,
  acr: null,
  scope: null,
};

function resetCredentials() {
  return INITIAL_STATE;
}

function updateIdentity(state, { identity }) {
  return {
    ...state,
    identity: mergeIdentity(state, identity),
  };
}

function updateCredentials(state, { credentials: { identity, ...rest } }) {
  return {
    ...state,
    identity: mergeIdentity(state, identity),
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
const getState = ({ auth }) => auth;

export const getCurrentUserSelector = createSelector(
  (state) => state.auth,
  (items) => items.identity,
);

export const selectors = {
  id: createSelector(
    getState,
    prop('id'),
  ),
  token: createSelector(
    getState,
    prop('token'),
  ),
  identity: createSelector(
    getState,
    prop('identity'),
  ),
  identityId: createSelector(
    getState,
    prop('identityId'),
  ),
};

// REDUCER
export default createResetOnSignOutReducer(INITIAL_STATE, {
  [AUTH_RESET]: resetCredentials,
  [SIGN_IN]: updateCredentials,
  [LOAD_USER]: updateCredentials,
  [UPDATE_IDENTITY]: updateIdentity,
  [LOAD_USER_ROLES]: updateRoles,
  [ADD_USER_ROLE]: addUserRole,
});
