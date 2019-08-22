import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { RESET_APP } from '@misakey/store/actions/app';
import { SIGN_OUT } from '@misakey/auth/store/actions/auth';

import { makeReducer } from '@misakey/store/reducers/entities';

import reducers from '@misakey/store/reducers';
import auth from '@misakey/auth/store/reducers/auth';

import screens from './screens';

const authPersistConfig = {
  key: 'auth',
  storage,
  blacklist: ['profile'],
};

const appReducer = combineReducers({
  auth: persistReducer(authPersistConfig, auth),
  screens,
  ...reducers,
  entities: makeReducer({
    services: {},
  }),
});

const rootReducer = (state, action) => {
  let newState = state;

  if (action.type === RESET_APP || action.type === SIGN_OUT) {
    if (storage && storage.removeItem) {
      Object.keys(state).forEach((key) => {
        if (key !== 'global') {
          storage.removeItem(`persist:${key}`);
        }
      });
    }

    // Global state needs to be manually reset.
    newState = { global: state.global };
  }
  return appReducer(newState, action);
};

export default rootReducer;
