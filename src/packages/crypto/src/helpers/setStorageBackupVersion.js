import storage from '@misakey/helpers/storage';

// CONSTANTS
export const STORAGE_KEY = 'CRYPTO_BACKUP_VERSION';

export default (backupVersion) => storage.setItem(STORAGE_KEY, backupVersion);
