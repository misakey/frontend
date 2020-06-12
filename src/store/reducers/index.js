import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';

import { RESET_APP } from '@misakey/store/actions/app';

import { authPersistedReducers } from '@misakey/auth/store/reducers';
import storeReducers from '@misakey/store/reducers';
import { makeReducer as makeEntities } from '@misakey/store/reducers/entities';

import crypto from '@misakey/crypto/store/reducer';

import { wrapReducerWithResetOnSignOut } from '@misakey/auth/store/reducers/helpers/createResetOnSignOutReducer';
import userBoxesPagination from 'store/reducers/userBoxes/pagination';

import devicePreferences from './devicePreferences';
import screens from './screens';
import warning from './warning';

const appReducer = combineReducers({
  ...authPersistedReducers,
  ...storeReducers,
  ...devicePreferences,
  screens,
  warning,
  crypto,
  ...userBoxesPagination,
  entities: wrapReducerWithResetOnSignOut({
    // New app
    boxes: {},
    events: {},
    // old app
    applications: {},
    users: {},
    services: {},
    blobs: {},
  }, {}, makeEntities),
});

const rootReducer = (state, action) => {
  let newState = state;

  if (action.type === RESET_APP) {
    // @FIXME we could use persistor.purge instead of this very specific implem
    // It highly depends on external settings, namely "persist:key"
    // https://github.com/rt2zz/redux-persist/blob/master/docs/api.md#type-persistor
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
