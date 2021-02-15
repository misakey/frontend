
import { splitBoxSecretKey } from '@misakey/crypto/box/keySplitting';
import { setBoxKeyShare } from '@misakey/crypto/HttpApi';
import { selectors as cryptoSelectors } from '@misakey/crypto/store/reducers';

import setBoxSecrets from './setBoxSecrets';

const { getAsymSecretKey } = cryptoSelectors;

export default ({ boxId, publicKey: boxPublicKey }) => (
  async (dispatch, getState) => {
    const state = getState();
    const boxSecretKey = getAsymSecretKey(boxPublicKey)(state);

    const {
      invitationKeyShare,
      misakeyKeyShare,
    } = splitBoxSecretKey({ boxSecretKey, boxPublicKey });

    await setBoxKeyShare({ boxId, boxKeyShare: misakeyKeyShare });

    // action `setBoxSecrets` takes care of updating the secret storage
    await dispatch(setBoxSecrets({ boxId, keyShare: invitationKeyShare }));
  }
);
