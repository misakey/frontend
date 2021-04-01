
import { splitBoxSecretKey } from '@misakey/core/crypto/box/keySplitting';
import { setBoxKeyShare } from '@misakey/core/crypto/HttpApi';
import { selectors as cryptoSelectors } from '@misakey/react/crypto/store/reducers';

import setBoxSecrets from './setBoxSecrets';

const { makeGetAsymSecretKey } = cryptoSelectors;

export default ({ boxId, publicKey: boxPublicKey }) => (
  async (dispatch, getState) => {
    const state = getState();
    const getAsymSecretKey = makeGetAsymSecretKey();
    const boxSecretKey = getAsymSecretKey(state, boxPublicKey);

    const {
      invitationKeyShare,
      misakeyKeyShare,
    } = splitBoxSecretKey({ boxSecretKey, boxPublicKey });

    await setBoxKeyShare({ boxId, boxKeyShare: misakeyKeyShare });

    // action `setBoxSecrets` takes care of updating the secret storage
    await dispatch(setBoxSecrets({ boxId, keyShare: invitationKeyShare }));
  }
);
