import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import auth from '@misakey/auth/store/reducers/auth';
import sso from '@misakey/auth/store/reducers/sso';

const authPersistConfig = { key: 'auth', storage, whitelist: ['identity'], blacklist: [] };
const ssoPersistConfig = { key: 'sso', storage, whitelist: ['authnStep'], blacklist: [] };

export const authPersistedReducers = {
  auth: persistReducer(authPersistConfig, auth),
  sso: persistReducer(ssoPersistConfig, sso),
};

export default { auth, sso };
