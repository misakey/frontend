import { applyMiddleware, compose, createStore, combineReducers } from 'redux';
import thunk from 'redux-thunk';

import cryptoReducer from './store/reducers';

import {
  // createNewOwnerSecrets,
  CRYPTO_LOAD_SECRETS,
} from './store/actions/concrete';
// import hardPasswordChange from './store/actions/hardPasswordChange';
// import importSecrets from './store/actions/importSecrets';
import {
  publicKeysWeCanDecryptFrom,
} from './hooks/useBoxPublicKeysWeCanDecryptFrom';

import './testHelpers/argon2Mocking';
// this will also set variable "window.env" required by package API
// import { buildJsonResponse } from './testHelpers/http';


// Mocking fetch API
jest.spyOn(global, 'fetch');

// const PASSWORD = 'password';
// const openPasswordPrompt = () => ({ password: PASSWORD });

// @FIXME https://gitlab.misakey.dev/misakey/frontend/-/issues/609
// test('crypto store handles creation, reset and import correctly', async () => {
//   const storeMiddleWares = [thunk];
//   const reducer = combineReducers({
//     crypto: cryptoReducer,
//     auth: () => ({ identity: { id: 'fake-test-id' } }),
//   });

//   const store = createStore(reducer, compose(applyMiddleware(...storeMiddleWares)));

//   expect(publicKeysWeCanDecryptFrom(store.getState().crypto.secrets).size).toBe(0);

//   await store.dispatch(createNewOwnerSecrets(PASSWORD));

//   const { secrets } = store.getState().crypto;
//   const pubkeysBeforeReset = publicKeysWeCanDecryptFrom(secrets);
//   expect(pubkeysBeforeReset.size).toBe(1);

//   const secretsCopy = { ...secrets }; // XXX better name? can we make it anonymous?
//   // mocking the "file" object you get from a `<input type="file">`
//   const toImport = {
//     text: () => JSON.stringify(secretsCopy),
//   };

//   store.dispatch(hardPasswordChange(PASSWORD));
//   expect(publicKeysWeCanDecryptFrom(store.getState().crypto.secrets).size).toBe(1);

//   fetch.mockResolvedValueOnce(buildJsonResponse({}));
//   await store.dispatch(importSecrets(toImport, openPasswordPrompt));
//   const pubkeysAfterImport = publicKeysWeCanDecryptFrom(store.getState().crypto.secrets);

//   expect(pubkeysAfterImport.size).toEqual(2);
//   expect(
//     Array.from(pubkeysAfterImport.keys()),
//   ).toEqual(
//     expect.arrayContaining(
//       Array.from(pubkeysBeforeReset.keys()),
//     ),
//   );
// });

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

  expect(() => publicKeysWeCanDecryptFrom(store.getState().crypto.secrets)).not.toThrow();
});
