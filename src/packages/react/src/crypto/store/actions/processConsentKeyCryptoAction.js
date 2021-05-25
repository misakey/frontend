import isNil from '@misakey/core/helpers/isNil';
import { decryptCryptoaction } from '@misakey/core/crypto/cryptoactions';
import { selectors as cryptoSelectors } from '@misakey/react/crypto/store/reducers';
import {
  DecryptionKeyNotFound,
} from '@misakey/core/crypto/Errors/classes';

import addConsentKey from './addConsentKey';

const {
  makeGetAsymSecretKey,
} = cryptoSelectors;

export default ({ cryptoaction }) => (
  async (dispatch, getState) => {
    const { encrypted, encryptionPublicKey } = cryptoaction;
    const state = getState();
    const getAsymSecretKey = makeGetAsymSecretKey();
    const secretKey = getAsymSecretKey(state, encryptionPublicKey);
    if (isNil(secretKey)) {
      throw new DecryptionKeyNotFound(`crypto action public key: "${encryptionPublicKey}"`);
    }

    const { consentSecretKey } = decryptCryptoaction(encrypted, secretKey);

    await dispatch(addConsentKey({ consentSecretKey }));
  }
);
