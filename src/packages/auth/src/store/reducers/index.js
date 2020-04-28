import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import auth from '@misakey/auth/store/reducers/auth';

const authPersistConfig = { key: 'auth', storage, whitelist: ['profile'], blacklist: [] };
export const authPersistedReducers = {
  auth: persistReducer(authPersistConfig, auth),
};

export default { auth };
