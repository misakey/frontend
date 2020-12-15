import isNil from '@misakey/helpers/isNil';

import { decryptCryptoaction } from '@misakey/crypto/cryptoactions';

import {
  CRYPTO_SET_BOX_SECRETS,
} from './types';

export default ({ cryptoaction, boxSecretKeysByPublicKeys }) => (
  async (dispatch) => {
    const { boxId, encrypted, encryptionPublicKey } = cryptoaction;

    // it is planned to switch to having the mapping from pubkeys to secret keys
    // in the secret backup instead
    // but since this change requires a crypto migration
    // we are waiting for a good opportunity to do it.
    // see https://gitlab.misakey.dev/misakey/frontend/-/issues/856
    const secretKey = boxSecretKeysByPublicKeys.get(encryptionPublicKey);
    if (isNil(secretKey)) {
      throw Error(`no matching secret key for crypto action with public key ${encryptionPublicKey}`);
    }

    // see `box/keySplitting.js`
    // for the shape of the encrypted payload of a `set_box_key_share` cryptoaction
    const { boxKeyShare } = decryptCryptoaction(encrypted, secretKey);

    dispatch({
      type: CRYPTO_SET_BOX_SECRETS,
      boxId,
      keyShare: boxKeyShare,
    });
  }
);
