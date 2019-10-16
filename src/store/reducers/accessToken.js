import createReducer from '@misakey/store/reducers/helpers/createReducer';
import { ACCESS_TOKEN_RESET, ACCESS_TOKEN_UPDATE } from 'store/actions/accessToken';

const initialState = {};

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
  [ACCESS_TOKEN_RESET]: reset,
  [ACCESS_TOKEN_UPDATE]: update,
});
