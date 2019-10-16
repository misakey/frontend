import createReducer from '@misakey/store/reducers/helpers/createReducer';

import {
  SCREEN_AUTH_RESET,
  SCREEN_AUTH_SET_EMAIL,
  SCREEN_AUTH_SET_PASSWORD,
} from 'store/actions/screens/auth';

const initialState = { email: '' };

function setEmail(state, { email }) {
  return { ...state, email };
}

function setPassword(state, { password }) {
  return { ...state, password };
}

function reset() {
  return { ...initialState };
}

export default createReducer(initialState, {
  [SCREEN_AUTH_RESET]: reset,
  [SCREEN_AUTH_SET_EMAIL]: setEmail,
  [SCREEN_AUTH_SET_PASSWORD]: setPassword,
});
