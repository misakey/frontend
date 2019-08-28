import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';

import { RESET_APP } from '@misakey/store/actions/app';
import { SIGN_OUT } from '@misakey/auth/store/actions/auth';

import authReducers from '@misakey/auth/store/reducers';
import global from '@misakey/store/reducers/global';
import { makeReducer as makeEntities } from '@misakey/store/reducers/entities';
import Layout from './Layout';
import screens from './screens';

const entities = makeEntities({
  users: {},
  services: {},
});

const appReducer = combineReducers({
  ...authReducers,
  global,
  Layout,
  screens,
  entities: makeEntities(entities),
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
