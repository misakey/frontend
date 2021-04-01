import {
  CRYPTO_SET_ROOT_KEY_SHARE,
} from './types';

export default ({ rootKeyShare, accountId }) => ({
  type: CRYPTO_SET_ROOT_KEY_SHARE,
  rootKeyShare,
  accountId,
});
