import PropTypes from 'prop-types';

import { METHODS } from '@misakey/auth/constants/method';

import head from '@misakey/helpers/head';
import isArray from '@misakey/helpers/isArray';
import createResetOnSignOutReducer from '@misakey/auth/store/reducers/helpers/createResetOnSignOutReducer';

import { SSO_RESET, SSO_UPDATE } from '@misakey/auth/store/actions/sso';

// CONSTANTS
export const PROP_TYPES = {
  client: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    logoUri: PropTypes.string,
  }),
  identity: PropTypes.shape({
    displayName: PropTypes.string,
    avatarUrl: PropTypes.string,
  }),
  authnStep: PropTypes.shape({
    identityId: PropTypes.string,
    methodName: PropTypes.oneOf(METHODS),
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
