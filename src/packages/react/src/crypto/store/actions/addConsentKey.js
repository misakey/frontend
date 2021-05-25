import { selectors as cryptoSelectors } from '@misakey/react/crypto/store/reducers';
import {
  uploadAsymKeyForStorage,
} from '@misakey/core/crypto/secretStorage';

import {
  CRYPTO_ADD_CONSENT_KEY,
} from './types';

const {
  getRootKey: getRootKeySelector,
} = cryptoSelectors;

export default ({ consentSecretKey }) => (
  async (dispatch, getState) => {
    const state = getState();

    dispatch({
      type: CRYPTO_ADD_CONSENT_KEY,
      secretKey: consentSecretKey,
    });

    const rootKey = getRootKeySelector(state);
    await uploadAsymKeyForStorage({ secretKey: consentSecretKey, rootKey });
  }
);
