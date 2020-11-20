import { CRYPTO_SET_BACKUP_VERSION } from './types';

export default (version) => ({
  type: CRYPTO_SET_BACKUP_VERSION,
  version,
});
