export const CRYPTO_SET_SECRET_KEY = Symbol('CRYPTO_SET_SECRET_KEY');

export const setUserSecretKey = (secretKey) => ({
  type: CRYPTO_SET_SECRET_KEY,
  secretKey,
});
