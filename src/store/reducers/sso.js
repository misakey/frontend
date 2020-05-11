import createResetOnSignOutReducer from '@misakey/auth/store/reducers/helpers/createResetOnSignOutReducer';

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

function update(state, { sso }) {
  return {
    ...state,
    ...sso,
  };
}

export default createResetOnSignOutReducer(initialState, {
  [SSO_RESET]: reset,
  [SSO_UPDATE]: update,
});
