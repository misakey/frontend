import createAuthReducer from 'store/reducers/helpers/createAuthReducer';
import {
  ACCESS_RESET,
  ACCESS_REQUEST_UPDATE, ACCESS_REQUEST_SET_PRODUCER_KEY,
  ACCESS_TOKEN_UPDATE,
} from 'store/actions/access';

const initialState = {
  request: {},
  token: {},
  producerKey: null,
};

function reset() {
  return initialState;
}


function updateRequest(state, { type, ...rest }) {
  return {
    ...state,
    request: { ...state.request, ...rest },
  };
}

function updateToken(state, { type, ...rest }) {
  return {
    ...state,
    token: { ...state.token, ...rest },
  };
}

const setProducerKey = (state, { producerKey }) => ({
  ...state,
  producerKey,
});

export default createAuthReducer(initialState, {
  [ACCESS_RESET]: reset,
  [ACCESS_REQUEST_UPDATE]: updateRequest,
  [ACCESS_TOKEN_UPDATE]: updateToken,
  [ACCESS_REQUEST_SET_PRODUCER_KEY]: setProducerKey,
});
