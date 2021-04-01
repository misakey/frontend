import isNil from '@misakey/core/helpers/isNil';
import { selectors as cryptoSelectors } from '@misakey/react/crypto/store/reducers';
import {
  uploadAsymKeyForStorage,
  uploadBoxKeyShareForStorage,
} from '@misakey/core/crypto/secretStorage';

import {
  CRYPTO_SET_BOX_SECRETS,
} from './types';

const {
  getRootKey: getRootKeySelector,
} = cryptoSelectors;


/**
 * set secret key and/or key share for a box
 *
 * this will overwrite the existing key share for this box if any
 */
export default ({ boxId, secretKey, keyShare }) => (
  async (dispatch, getState) => {
    const state = getState();

    await dispatch({
      type: CRYPTO_SET_BOX_SECRETS,
      boxId,
      secretKey,
      keyShare,
    });

    const rootKey = getRootKeySelector(state);
    if (isNil(rootKey)) {
      return;
    }

    if (!isNil(secretKey)) {
      await uploadAsymKeyForStorage({ secretKey, rootKey });
    }
    if (!isNil(keyShare)) {
      await uploadBoxKeyShareForStorage({ boxId, share: keyShare, rootKey });
    }
  }
);
