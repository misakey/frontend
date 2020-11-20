import {
  CRYPTO_SET_ENCRYPTED_BACKUP_DATA,
} from './types';

export default ({ data, backupVersion }) => ({
  type: CRYPTO_SET_ENCRYPTED_BACKUP_DATA,
  data,
  backupVersion,
});
