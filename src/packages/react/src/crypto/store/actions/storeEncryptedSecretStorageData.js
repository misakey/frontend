import {
  CRYPTO_SET_ENCRYPTED_SECRET_STORAGE_DATA,
} from './types';

export default ({ data }) => ({
  type: CRYPTO_SET_ENCRYPTED_SECRET_STORAGE_DATA,
  data,
});
