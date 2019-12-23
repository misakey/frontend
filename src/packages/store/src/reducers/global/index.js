import createReducer from '../helpers/createReducer';
import { UPDATE_GLOBAL_STATE } from '../../actions/global';

const initialState = {
  isBetaDisclaimerApproved: null,
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
