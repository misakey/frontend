import createReducer from '@misakey/store/reducers/helpers/createReducer';
import { ACCESS_REQUEST_RESET, ACCESS_REQUEST_UPDATE } from 'store/actions/accessRequest';

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
  [ACCESS_REQUEST_RESET]: reset,
  [ACCESS_REQUEST_UPDATE]: update,
});
