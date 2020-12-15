import { publicKeysWeCanDecryptFrom } from '@misakey/crypto/hooks/useBoxPublicKeysWeCanDecryptFrom';
import { selectors as cryptoSelectors } from '@misakey/crypto/store/reducers';
import asyncBatch from 'helpers/batch/async';

import ensureIdentityKey from './ensureIdentityKey';
import ensureNonIdentifiedKey from './ensureNonIdentifiedKey';
import pullCryptoactions from './pullCryptoactions';

import {
  CRYPTO_LOAD_SECRETS,
} from './types';

/**
 * set secrets and backup info for a data owner.
 *
 * **No backup update** because this action is usually used during the backup update
 */
export default ({ secrets, backupKey, backupVersion }) => (
  async (dispatch, getState) => {
    // TODO check if migration is needed (when we have crypto migrations)

    await asyncBatch(async () => {
      dispatch({
        type: CRYPTO_LOAD_SECRETS,
        secrets,
        backupKey,
        backupVersion,
      });

      await dispatch(ensureIdentityKey());
      await dispatch(ensureNonIdentifiedKey());

      // state *after* secret loading (should contain secret keys)
      const state = getState();

      const boxSecretKeys = cryptoSelectors.getBoxSecretKeys(state);

      const boxSecretKeysByPublicKeys = publicKeysWeCanDecryptFrom(boxSecretKeys);

      await dispatch(pullCryptoactions({ boxSecretKeysByPublicKeys }));
    });
  }
);
