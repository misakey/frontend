export const CRYPTO_LOAD_SECRETS = Symbol('CRYPTO_LOAD_SECRETS');
export const CRYPTO_IMPORT_SECRET_KEYS = Symbol('CRYPTO_IMPORT_SECRET_KEYS');
export const CRYPTO_SET_BOX_SECRETS = Symbol('CRYPTO_SET_BOX_SECRETS');
export const CRYPTO_SET_ENCRYPTED_SECRET_STORAGE_DATA = Symbol('CRYPTO_SET_ENCRYPTED_SECRET_STORAGE_DATA');
export const CRYPTO_DELETE_SECRETS = Symbol('CRYPTO_DELETE_SECRETS');
export const CRYPTO_SET_ROOT_KEY_SHARE = Symbol('CRYPTO_SET_ROOT_KEY_SHARE');
// TODO remove these 3 types? These values are only set during migration now,
// not through individual actions
export const CRYPTO_SET_VAULT_KEY = Symbol('CRYPTO_SET_VAULT_KEY');
export const CRYPTO_SET_IDENTITY_KEY = Symbol('CRYPTO_SET_IDENTITY_KEY');
export const CRYPTO_SET_IDENTITY_NON_IDENTIFIED_KEYS = Symbol('CRYPTO_SET_IDENTITY_NON_IDENTIFIED_KEYS');
