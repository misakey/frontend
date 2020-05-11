import { createSelector } from 'reselect';
import createResetOnSignOutReducer from '@misakey/auth/store/reducers/helpers/createResetOnSignOutReducer';
import { SCREEN_SERVICE_RESET, SCREEN_SERVICE_UPDATE } from 'store/actions/screens/Service';

import prop from '@misakey/helpers/prop';

const initialState = {
  mainDomain: null,
  id: null,
  updatedAt: null,
};

function reset() {
  return initialState;
}

function update(state, { screenService }) {
  return {
    ...state,
    ...screenService,
  };
}

// SELECTORS
const getState = (state) => state.screens.Service;

const getMainDomain = createSelector(
  getState,
  prop('mainDomain'),
);

export const selectors = {
  getMainDomain,
};


// REDUCER
export default createResetOnSignOutReducer(initialState, {
  [SCREEN_SERVICE_RESET]: reset,
  [SCREEN_SERVICE_UPDATE]: update,
});
