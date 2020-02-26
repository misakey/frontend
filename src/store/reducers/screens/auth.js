import createAuthReducer from 'store/reducers/helpers/createAuthReducer';

import {
  SCREEN_AUTH_RESET,
  SCREEN_AUTH_SET_IDENTIFIER,
  SCREEN_AUTH_SET_SECRET,
  SCREEN_AUTH_SET_PUBLICS,
} from 'store/actions/screens/auth';

const initialState = { identifier: '', secret: null, publics: null };

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

export default createAuthReducer(initialState, {
  [SCREEN_AUTH_RESET]: reset,
  [SCREEN_AUTH_SET_IDENTIFIER]: setIdentifier,
  [SCREEN_AUTH_SET_SECRET]: setSecret,
  [SCREEN_AUTH_SET_PUBLICS]: setPublics,
});
