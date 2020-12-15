import { splitBoxSecretKey } from '@misakey/crypto/box/keySplitting';
import { setBoxKeyShare } from '@misakey/crypto/HttpApi';

import setBoxSecrets from './setBoxSecrets';

/**
 * TODO when mapping from public key to secret key is stored in secret backup
 * (see https://gitlab.misakey.dev/misakey/frontend/-/issues/856)
 * get the box public and secret keys from the store
 * instead of relying on the caller to provide them.
 */
export default ({ boxId, boxSecretKey, boxPublicKey }) => (
  async (dispatch) => {
    const {
      invitationKeyShare,
      misakeyKeyShare,
    } = splitBoxSecretKey({ boxSecretKey, boxPublicKey });

    await setBoxKeyShare({ boxId, boxKeyShare: misakeyKeyShare });

    // action `setBoxSecrets` takes care of updating the secret backup
    await dispatch(setBoxSecrets({ boxId, keyShare: invitationKeyShare }));
  }
);
