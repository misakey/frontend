import createAuthReducer from 'store/reducers/helpers/createAuthReducer';
import {
  ACCESS_RESET,
  ACCESS_REQUEST_UPDATE, ACCESS_REQUEST_SET_PRODUCER_KEY,
} from 'store/actions/access';

const initialState = {
  request: {},
  token: {},
  producerKey: null,
};

function reset() {
  return initialState;
}


function updateRequest(state, { accessRequest }) {
  return {
    ...state,
    request: { ...state.request, ...accessRequest },
  };
}
const setProducerKey = (state, { producerKey }) => ({
  ...state,
  producerKey,
});

export default createAuthReducer(initialState, {
  [ACCESS_RESET]: reset,
  [ACCESS_REQUEST_UPDATE]: updateRequest,
  [ACCESS_REQUEST_SET_PRODUCER_KEY]: setProducerKey,
});
