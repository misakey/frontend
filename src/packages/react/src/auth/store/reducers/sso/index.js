import PropTypes from 'prop-types';

import { PROP_TYPES as REQUESTED_CONSENT_PROP_TYPES } from '@misakey/react/auth/constants/propTypes/requestedConsent';
import {
  SSO_RESET, SSO_UPDATE, SSO_IDENTITY_RESET,
  SSO_SET_IDENTIFIER, SSO_SET_METHOD_METADATA, SSO_SET_METHOD_NAME,
} from '@misakey/react/auth/store/actions/sso';
import { AMRS, IDENTITY_PASSWORD, IDENTITY_EMAILED_CODE, WEBAUTHN } from '@misakey/core/auth/constants/amr';

import isNil from '@misakey/core/helpers/isNil';
import prop from '@misakey/core/helpers/prop';
import path from '@misakey/core/helpers/path';
import { parseAcrValues, parseAcr } from '@misakey/core/helpers/parseAcr';
import createResetOnSignOutReducer from '@misakey/react/auth/store/reducers/helpers/createResetOnSignOutReducer';
import { createSelector } from 'reselect';


// HELPERS
const getMethodName = prop('methodName');
const getState = prop('sso');

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
    hasCrypto: PropTypes.bool,
  }),
  authnState: PropTypes.shape({
    identityId: PropTypes.string,
    currentAcr: PropTypes.number,
    requiredAcr: PropTypes.number,
    currentAmrs: PropTypes.arrayOf(PropTypes.string),
    availableAmrs: PropTypes.arrayOf(PropTypes.string),
  }),
  methodName: PropTypes.oneOf(AMRS),
  metadata: PropTypes.shape({
    [IDENTITY_PASSWORD]: PropTypes.shape({
      memory: PropTypes.number,
      iterations: PropTypes.number,
      parallelism: PropTypes.number,
      salt_base_64: PropTypes.string,
    }),
    [IDENTITY_EMAILED_CODE]: PropTypes.string,
    [WEBAUTHN]: PropTypes.shape({
      publicKey: PropTypes.shape({
        challenge: PropTypes.string.isRequired,
        allowCredentials: PropTypes.arrayOf(PropTypes.shape({
          id: PropTypes.string.isRequired,
        })),
      }),
    }),
  }),
  loginChallenge: PropTypes.string,
  loginHint: PropTypes.string,
  displayHints: PropTypes.object,
  cbHintsKey: PropTypes.string,
  scope: PropTypes.string,
  acr: PropTypes.number,
  acrValues: PropTypes.arrayOf(PropTypes.string),
  requestedConsents: PropTypes.arrayOf(PropTypes.shape(REQUESTED_CONSENT_PROP_TYPES)),
  // not an identity schema because we didn't finish flow
  subjectIdentity: PropTypes.shape({
    id: PropTypes.string.isRequired,
    accountId: PropTypes.string,
    identifierValue: PropTypes.string.isRequired,
    identifierKind: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string,
  }),
};

// INITIAL STATE
export const INITIAL_STATE = {
  client: {},
  identifier: null,
  identity: null,
  authnState: {},
  methodName: null,
  metadata: {},
  loginChallenge: null,
  clientId: null,
  cbHintsKey: null,
  loginHint: null,
  displayHints: {},
  scope: null,
  acr: null,
  acrValues: [],
  requestedConsents: [],
  subjectIdentity: null,
};

export const selectors = {
  authnState: createSelector(
    getState,
    prop('authnState'),
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
  cbHintsKey: createSelector(
    getState,
    prop('cbHintsKey'),
  ),
  client: createSelector(
    getState,
    prop('client'),
  ),
  displayHints: createSelector(
    getState,
    prop('displayHints'),
  ),
  acr: createSelector(
    getState,
    prop('acr'),
  ),
  scope: createSelector(
    getState,
    prop('scope'),
  ),
  subjectIdentity: createSelector(
    getState,
    prop('subjectIdentity'),
  ),
  requestedConsents: createSelector(
    getState,
    prop('requestedConsents'),
  ),
  methodName: createSelector(
    getState,
    getMethodName,
  ),
  methodMetadata: createSelector(
    getState,
    (sso) => path(['metadata', getMethodName(sso)])(sso),
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

function onSetMethodName(state, { methodName }) {
  return {
    ...state,
    methodName,
  };
}

function onSetMethodMetadata(state, { methodName, metadata }) {
  return {
    ...state,
    metadata: {
      ...state.metadata,
      [methodName]: metadata,
    },
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
    identifier: null,
    authnState: {},
    methodName: null,
    metadata: {},
  };
}


// REDUCER
export default createResetOnSignOutReducer(INITIAL_STATE, {
  [SSO_RESET]: onReset,
  [SSO_IDENTITY_RESET]: onClearSsoUpdate,
  [SSO_UPDATE]: onUpdate,
  [SSO_SET_IDENTIFIER]: onSetIdentifier,
  [SSO_SET_METHOD_NAME]: onSetMethodName,
  [SSO_SET_METHOD_METADATA]: onSetMethodMetadata,
});
