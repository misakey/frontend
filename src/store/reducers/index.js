import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';

import { RESET_APP } from '@misakey/store/actions/app';

import authReducers from '@misakey/auth/store/reducers';
import reducers from '@misakey/store/reducers';
import { makeReducer as makeEntities } from '@misakey/store/reducers/entities';

import accessRequest from './accessRequest';
import accessToken from './accessToken';
import Layout from './Layout';
import screens from './screens';
import sso from './sso';

const appReducer = combineReducers({
  ...authReducers,
  ...reducers,
  accessRequest,
  accessToken,
  Layout,
  screens,
  sso,
  entities: makeEntities({
    applications: {},
    users: {},
    services: {},
  }),
});

const rootReducer = (state, action) => {
  let newState = state;

  if (action.type === RESET_APP) {
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
