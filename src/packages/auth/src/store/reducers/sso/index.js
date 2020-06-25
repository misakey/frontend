import PropTypes from 'prop-types';

import { METHODS } from '@misakey/auth/constants/method';
import { PROP_TYPES as PWD_HASH_PROP_TYPES } from '@misakey/auth/passwordHashing/constants';
import head from '@misakey/helpers/head';
import isArray from '@misakey/helpers/isArray';
import prop from '@misakey/helpers/prop';
import createResetOnSignOutReducer from '@misakey/auth/store/reducers/helpers/createResetOnSignOutReducer';
import { createSelector } from 'reselect';

import { SSO_RESET, SSO_UPDATE } from '@misakey/auth/store/actions/sso';

// CONSTANTS
export const PROP_TYPES = {
  client: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    logoUri: PropTypes.string,
  }),
  // not an identity schema because we didn't pass auth flow yet
  identity: PropTypes.shape({
    displayName: PropTypes.string,
    avatarUrl: PropTypes.string,
  }),
  authnStep: PropTypes.shape({
    identityId: PropTypes.string,
    methodName: PropTypes.oneOf(METHODS),
    metadata: PropTypes.shape(PWD_HASH_PROP_TYPES),
  }),
  loginChallenge: PropTypes.string,
  loginHint: PropTypes.string,
  scope: PropTypes.arrayOf(PropTypes.string),
  acr: PropTypes.number,
  acrValues: PropTypes.arrayOf(PropTypes.string),
};

// INITIAL STATE
export const INITIAL_STATE = {
  client: {},
  identity: {},
  authnStep: {},
  loginChallenge: null,
  loginHint: null,
  scope: [],
  acr: null,
  acrValues: [],
};

const getState = prop('sso');

export const selectors = {
  getAuthnStep: createSelector(
    getState,
    prop('authnStep'),
  ),
};

// ACTION HANDLERS
function onReset() {
  return INITIAL_STATE;
}

function onUpdate(state, { sso: { acrValues, ...rest } }) {
  return {
    ...state,
    ...rest,
    acr: isArray(acrValues) ? parseInt(head(acrValues), 10) : null,
    acrValues,
  };
}

// REDUCER
export default createResetOnSignOutReducer(INITIAL_STATE, {
  [SSO_RESET]: onReset,
  [SSO_UPDATE]: onUpdate,
});
