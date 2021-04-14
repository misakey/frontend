import { persistReducer, createMigrate } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import auth from '@misakey/react/auth/store/reducers/auth';
import sso from '@misakey/react/auth/store/reducers/sso';

const migrations = {
  // migration clear out identity state to trigger a re-fetch
  // migration from -1 to 0 is for update from backend migration that replaced `hasAccount`
  // by `hasCrypto`
  0: (state) => ({
    ...state,
    identity: null,
  })
  ,
};

const authPersistConfig = {
  key: 'auth',
  storage,
  version: 0,
  whitelist: ['identity'],
  blacklist: [],
  migrate: createMigrate(migrations, { debug: false }),
};

export const authPersistedReducers = {
  auth: persistReducer(authPersistConfig, auth),
  sso,
};

export default { auth, sso };
