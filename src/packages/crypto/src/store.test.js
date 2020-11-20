import { applyMiddleware, compose, createStore, combineReducers } from 'redux';
import thunk from 'redux-thunk';

import cryptoReducer, { selectors } from './store/reducers';

import {
  // createNewOwnerSecrets,
  CRYPTO_LOAD_SECRETS,
} from './store/actions/types';
// import hardPasswordChange from './store/actions/hardPasswordChange';
import {
  publicKeysWeCanDecryptFrom,
} from './hooks/useBoxPublicKeysWeCanDecryptFrom';

import './testHelpers/argon2Mocking';
// this will also set variable "window.env" required by package API
// import { buildJsonResponse } from './testHelpers/http';


// Mocking fetch API
jest.spyOn(global, 'fetch');

test('crypto store handles states from previous versions', async () => {
  const storeMiddleWares = [thunk];
  const reducer = combineReducers({
    crypto: cryptoReducer,
    auth: () => ({ identity: { id: 'fake-test-id' } }),
  });

  const store = createStore(reducer, compose(applyMiddleware(...storeMiddleWares)));

  await store.dispatch({
    type: CRYPTO_LOAD_SECRETS,
    // this is an extreme case where we load a state with nothing in it
    secrets: {},
    backupKey: 'test',
  });

  const secretKeys = selectors.getBoxSecretKeys(store.getState());

  expect(() => publicKeysWeCanDecryptFrom(secretKeys)).not.toThrow();
});
