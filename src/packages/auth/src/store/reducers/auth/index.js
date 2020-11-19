import createResetOnSignOutReducer from '@misakey/auth/store/reducers/helpers/createResetOnSignOutReducer';
import { createSelector } from 'reselect';

import merge from '@misakey/helpers/merge';
import isNil from '@misakey/helpers/isNil';
import prop from '@misakey/helpers/prop';
import { parseAcr } from '@misakey/helpers/parseAcr';

import {
  AUTH_RESET,
  LOAD_USER,
  SIGN_IN,
  UPDATE_IDENTITY,
  LOAD_USER_ROLES,
  ADD_USER_ROLE,
  SET_IS_AUTHENTICATED,
  CLEAR_IDENTITY,
} from '../../actions/auth';


// HELPERS
const mergeIdentity = (state, identity) => (isNil(identity)
  ? (state.identity)
  : merge({}, (state.identity || {}), identity)
);

const syncIdentity = (state, { identity, accountId, identityId }) => {
  if (isNil(state.identity) || !isNil(identity)) { return identity; }
  if (isNil(accountId) || isNil(identityId)) { return identity; }

  const { id: currentIdentityId, accountId: currentAccountId } = state.identity;

  const identityHasChanged = currentIdentityId !== identityId;
  const identityUpgrade = currentAccountId !== accountId;

  if (identityHasChanged) { return null; }
  if (identityUpgrade) { return { accountId, hasAccount: true }; }
  return {};
};

// INITIAL_STATE
export const INITIAL_STATE = {
  id: null,
  authenticatedAt: null,
  accountId: null,
  isAuthenticated: false,
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

function clearIdentity(state) {
  return {
    ...state,
    identity: INITIAL_STATE.identity,
  };
}

function updateCredentials(state, { credentials }) {
  const { identity, acr, ...rest } = credentials;

  const nextAcr = isNil(acr) ? state.acr : parseAcr(acr);

  const nextIdentity = syncIdentity(state, credentials);

  return {
    ...state,
    identity: mergeIdentity(state, nextIdentity),
    acr: nextAcr,
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

function setIsAuthenticated(state, { isAuthenticated }) {
  return {
    ...state,
    isAuthenticated,
  };
}

// SELECTORS
const getState = ({ auth }) => auth;

const identitySelector = createSelector(
  getState,
  prop('identity'),
);

export const getCurrentUserSelector = identitySelector;

const identifierSelector = createSelector(
  identitySelector,
  prop('identifier'),
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
  identity: identitySelector,
  accountId: createSelector(
    identitySelector,
    prop('accountId'),
  ),
  hasAccount: createSelector(
    identitySelector,
    prop('hasAccount'),
  ),
  identifierId: createSelector(
    identitySelector,
    prop('identifierId'),
  ),
  identifier: identifierSelector,
  identifierValue: createSelector(
    identifierSelector,
    prop('value'),
  ),
  identityId: createSelector(
    getState,
    prop('identityId'),
  ),
  isAuthenticated: createSelector(
    getState,
    prop('isAuthenticated'),
  ),
  acr: createSelector(
    getState,
    prop('acr'),
  ),
};

// REDUCER
export default createResetOnSignOutReducer(INITIAL_STATE, {
  [AUTH_RESET]: resetCredentials,
  [SIGN_IN]: updateCredentials,
  [LOAD_USER]: updateCredentials,
  [UPDATE_IDENTITY]: updateIdentity,
  [CLEAR_IDENTITY]: clearIdentity,
  [LOAD_USER_ROLES]: updateRoles,
  [ADD_USER_ROLE]: addUserRole,
  [SET_IS_AUTHENTICATED]: setIsAuthenticated,
});
