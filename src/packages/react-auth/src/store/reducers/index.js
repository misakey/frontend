import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import auth from '@misakey/react-auth/store/reducers/auth';
import sso from '@misakey/react-auth/store/reducers/sso';

const authPersistConfig = { key: 'auth', storage, whitelist: ['identity'], blacklist: [] };

export const authPersistedReducers = {
  auth: persistReducer(authPersistConfig, auth),
  sso,
};

export default { auth, sso };
