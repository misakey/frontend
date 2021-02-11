import { getBoxById } from 'store/reducers/box';

import { splitBoxSecretKey } from '@misakey/crypto/box/keySplitting';
import { setBoxKeyShare } from '@misakey/crypto/HttpApi';
import { selectors as cryptoSelectors } from '@misakey/crypto/store/reducers';

import setBoxSecrets from './setBoxSecrets';

const { getAsymSecretKey } = cryptoSelectors;

export default ({ boxId }) => (
  async (dispatch, getState) => {
    const state = getState();
    const { publicKey: boxPublicKey } = (getBoxById(state, boxId) || {});
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
