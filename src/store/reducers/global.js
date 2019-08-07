import { createReducer } from 'store/reducers/helpers';
import { UPDATE_GLOBAL_STATE } from 'store/actions/global';

const initialState = {

};

function update(state, { type, ...rest }) {
  return {
    ...state,
    ...rest,
  };
}

export default createReducer(initialState, {
  [UPDATE_GLOBAL_STATE]: update,
});
