import PropTypes from 'prop-types';

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
  SET_IS_AUTHENTICATED,
  CLEAR_IDENTITY,
} from '../../actions/auth';

// CONSTANTS
export const PROP_TYPES = {
  id: PropTypes.string,
  authenticatedAt: PropTypes.string,
  accountId: PropTypes.string,
  isAuthenticated: PropTypes.bool,
  identityId: PropTypes.string,
  // @FIXME we would need a schema
  identity: PropTypes.object,
  token: PropTypes.string,
  expiresAt: PropTypes.number,
  acr: PropTypes.number,
  scope: PropTypes.string,
};

// INITIAL_STATE
export const INITIAL_STATE = {
  id: null,
  authenticatedAt: null,
  accountId: null,
  isAuthenticated: false,
  identityId: null,
  identity: null,
  token: null,
  expiresAt: null,
  acr: null,
  scope: null,
};

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
  expiresAt: createSelector(
    getState,
    prop('expiresAt'),
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
  [SET_IS_AUTHENTICATED]: setIsAuthenticated,
});
