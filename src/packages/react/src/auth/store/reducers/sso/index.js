import PropTypes from 'prop-types';

import { METHODS } from '@misakey/core/auth/constants/method';
import { PROP_TYPES as PWD_HASH_PROP_TYPES } from '@misakey/react/auth/constants/propTypes/passwordHashing';
import isNil from '@misakey/core/helpers/isNil';
import prop from '@misakey/core/helpers/prop';
import { parseAcrValues, parseAcr } from '@misakey/core/helpers/parseAcr';
import createResetOnSignOutReducer from '@misakey/react/auth/store/reducers/helpers/createResetOnSignOutReducer';
import { createSelector } from 'reselect';

import { SSO_RESET, SSO_UPDATE, SSO_IDENTITY_RESET, SSO_SET_IDENTIFIER } from '@misakey/react/auth/store/actions/sso';

// CONSTANTS
export const PROP_TYPES = {
  client: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    logoUri: PropTypes.string,
    tosUri: PropTypes.string,
    policyUri: PropTypes.string,
  }),
  // not an identity schema because we didn't pass auth flow yet
  identity: PropTypes.shape({
    displayName: PropTypes.string,
    avatarUrl: PropTypes.string,
    hasAccount: PropTypes.bool,
  }),
  authnStep: PropTypes.shape({
    identityId: PropTypes.string,
    methodName: PropTypes.oneOf(METHODS),
    metadata: PropTypes.shape(PWD_HASH_PROP_TYPES),
  }),
  loginChallenge: PropTypes.string,
  loginHint: PropTypes.string,
  scope: PropTypes.string,
  acr: PropTypes.number,
  acrValues: PropTypes.arrayOf(PropTypes.string),
};

// INITIAL STATE
export const INITIAL_STATE = {
  client: {},
  identifier: null,
  identity: null,
  authnStep: {},
  loginChallenge: null,
  loginHint: {},
  scope: null,
  acr: null,
  acrValues: [],
};

const getState = prop('sso');

export const selectors = {
  getAuthnStep: createSelector(
    getState,
    prop('authnStep'),
  ),
  loginChallenge: createSelector(
    getState,
    prop('loginChallenge'),
  ),
  identity: createSelector(
    getState,
    prop('identity'),
  ),
  identifier: createSelector(
    getState,
    prop('identifier'),
  ),
  loginHint: createSelector(
    getState,
    prop('loginHint'),
  ),
  client: createSelector(
    getState,
    prop('client'),
  ),
  acr: createSelector(
    getState,
    prop('acr'),
  ),
  scope: createSelector(
    getState,
    prop('scope'),
  ),
};

// ACTION HANDLERS
function onReset() {
  return INITIAL_STATE;
}

function onSetIdentifier(state, { identifier }) {
  return {
    ...state,
    identifier,
  };
}

function onUpdate(state, { sso: { acrValues, acr, ...rest } }) {
  if (isNil(acrValues)) {
    return { ...state, ...rest };
  }
  let nextAcr = parseAcr(acr);

  if (isNil(nextAcr)) {
    nextAcr = parseAcrValues(acrValues);
  }

  return {
    ...state,
    ...rest,
    acr: nextAcr,
    acrValues,
  };
}

function onClearSsoUpdate(state) {
  return {
    ...state,
    identity: null,
  };
}


// REDUCER
export default createResetOnSignOutReducer(INITIAL_STATE, {
  [SSO_RESET]: onReset,
  [SSO_IDENTITY_RESET]: onClearSsoUpdate,
  [SSO_UPDATE]: onUpdate,
  [SSO_SET_IDENTIFIER]: onSetIdentifier,
});
