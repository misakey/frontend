import createReducer from '@misakey/store/reducers/helpers/createReducer';

import { SIGN_OUT } from '@misakey/auth/store/actions/auth';
import { SSO_RESET, SSO_UPDATE } from 'store/actions/sso';

const initialState = {
  clientId: null,
  clientName: null,
  loginChallenge: null,
  logoUri: null,
};

function reset() {
  return initialState;
}

function update(state, { type, ...rest }) {
  return {
    ...state,
    ...rest,
  };
}

export default createReducer(initialState, {
  [SIGN_OUT]: reset,
  [SSO_RESET]: reset,
  [SSO_UPDATE]: update,
});
