import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';

import { RESET_APP } from '@misakey/store/actions/app';

import authReducers from '@misakey/auth/store/reducers';
import reducers from '@misakey/store/reducers';
import { makeReducer as makeEntities } from '@misakey/store/reducers/entities';

import crypto from '@misakey/crypto/store/reducer';

import { wrapReducerWithAuth } from 'store/reducers/helpers/createAuthReducer';
import access from './access';
import bulkSelection from './bulkSelection';
import Layout from './Layout';
import screens from './screens';
import search from './search';
import sso from './sso';
import warning from './warning';
import { userApplicationsReducers, userApplicationsInitialState } from './applications/userApplications';

const appReducer = combineReducers({
  ...authReducers,
  ...reducers,
  access,
  bulkSelection,
  Layout,
  screens,
  search,
  sso,
  warning,
  crypto,
  entities: wrapReducerWithAuth({
    applications: {},
    users: {},
    services: {},
    databoxes: {},
    databoxesByProducer: {},
    applicationsByCategories: {},
    userEmails: {},
    // FIXME: create a combineReducers once we need to passe more custom reducers
    ...userApplicationsInitialState,
  }, userApplicationsReducers, makeEntities),
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
