import createReducer from '@misakey/store/reducers/helpers/createReducer';
import { SCREEN_SERVICE_RESET, SCREEN_SERVICE_UPDATE } from 'store/actions/screens/Service';

const initialState = {
  id: null,
  updatedAt: null,
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
  [SCREEN_SERVICE_RESET]: reset,
  [SCREEN_SERVICE_UPDATE]: update,
});
