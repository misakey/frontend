import {
  CRYPTO_SET_BACKUP_KEY_SHARE,
} from './types';

export default ({ backupKeyShare, accountId }) => ({
  type: CRYPTO_SET_BACKUP_KEY_SHARE,
  backupKeyShare,
  accountId,
});
