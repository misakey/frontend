import {
  CRYPTO_LOAD_SECRETS,
} from './types';

/**
 * set secrets and backup info for a data owner.
 *
 * **No backup update** because this action is usually used during the backup update
 */
export default ({ secrets, backupKey, backupVersion }) => ({
  type: CRYPTO_LOAD_SECRETS,
  secrets,
  backupKey,
  backupVersion,
});
