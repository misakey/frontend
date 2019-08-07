import { createReducer } from 'store/reducers/helpers';
import {
  AUTH_RESET,
  SIGN_OUT,
  SIGN_IN,
} from 'store/actions/auth';

const initialState = {
  id: null,
  authenticatedAt: null,
  profile: null,
  token: null,
  expiryAt: null,
};

function resetCredentials() {
  return initialState;
}

function updateCredentials(state, { type, ...rest }) {
  return {
    ...state,
    ...rest,
  };
}

export default createReducer(initialState, {
  [SIGN_OUT]: resetCredentials,
  [AUTH_RESET]: resetCredentials,
  [SIGN_IN]: updateCredentials,
});
