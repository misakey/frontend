import isNil from '@misakey/core/helpers/isNil';
import { decryptCryptoaction } from '@misakey/core/crypto/cryptoactions';
import { selectors as cryptoSelectors } from '@misakey/react/crypto/store/reducers';
import {
  uploadBoxKeyShareForStorage,
} from '@misakey/core/crypto/secretStorage';

import {
  CRYPTO_SET_BOX_SECRETS,
} from './types';

const {
  getRootKey: getRootKeySelector,
  makeGetAsymSecretKey,
} = cryptoSelectors;

export default ({ cryptoaction }) => (
  async (dispatch, getState) => {
    const { boxId, encrypted, encryptionPublicKey } = cryptoaction;
    const state = getState();
    const getAsymSecretKey = makeGetAsymSecretKey();
    const secretKey = getAsymSecretKey(state, encryptionPublicKey);
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

    const rootKey = getRootKeySelector(state);
    await uploadBoxKeyShareForStorage({ boxId, share: boxKeyShare, rootKey });
  }
);
