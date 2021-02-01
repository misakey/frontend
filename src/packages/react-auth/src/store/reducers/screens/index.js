import createResetOnSignOutReducer from '@misakey/react-auth/store/reducers/helpers/createResetOnSignOutReducer';

import {
  SCREEN_AUTH_RESET,
  SCREEN_AUTH_SET_IDENTIFIER,
  SCREEN_AUTH_SET_SECRET,
  SCREEN_AUTH_SET_PUBLICS,
} from '@misakey/react-auth/store/actions/screens';

const initialState = { identifier: null, secret: null, publics: null };

function setIdentifier(state, { identifier }) {
  return { ...state, identifier };
}

function setSecret(state, { secret }) {
  return { ...state, secret };
}

const setPublics = (state, { publics }) => ({ ...state, publics });

function reset() {
  return { ...initialState };
}

export default createResetOnSignOutReducer(initialState, {
  [SCREEN_AUTH_RESET]: reset,
  [SCREEN_AUTH_SET_IDENTIFIER]: setIdentifier,
  [SCREEN_AUTH_SET_SECRET]: setSecret,
  [SCREEN_AUTH_SET_PUBLICS]: setPublics,
});
