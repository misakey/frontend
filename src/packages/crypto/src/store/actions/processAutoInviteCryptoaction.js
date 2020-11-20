import { generatePath } from 'react-router-dom';

import routes from 'routes';

import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import { decryptCryptoaction } from '@misakey/crypto/cryptoactions';
import {
  getCryptoaction,
  deleteCryptoaction,
} from '@misakey/crypto/HttpApi';
import {
  fetchMisakeyKeyShare,
  combineBoxKeyShares,
} from '@misakey/crypto/box/keySplitting';

import updateBackup from './updateBackup';
import { CRYPTO_SET_BOX_SECRETS } from './types';

const {
  accountId: selectAccountId,
} = authSelectors;


export default ({ cryptoactionId, boxId: notificationBoxId }) => (
  async (dispatch, getState) => {
    const state = getState();

    const accountId = selectAccountId(state);

    const cryptoaction = await getCryptoaction({ accountId, cryptoactionId });
    const { encrypted, encryptionPublicKey, boxId: cryptoactionBoxId } = cryptoaction;

    if (notificationBoxId !== cryptoactionBoxId) {
      throw Error(`box ID is not the same in notification (${notificationBoxId}) and in cryptoaction ${cryptoactionBoxId}`);
    }

    const secretKey = state.crypto.secrets.identityKeys.secretKeys[encryptionPublicKey];
    const decryptedCryptoaction = decryptCryptoaction(encrypted, secretKey);
    // in the near future, auto-invite crypto actions will contain the box secret key
    // instead of the box key share
    // because we want the auto-invitation to stay valid even if the box key share changes
    const { boxKeyShare: decryptedBoxKeyShare } = decryptedCryptoaction;
    // we expect a box key share encoded as unpadded url-safe base64.
    // box key share is 32 bytes so ceil(32*8/6)=43 base64 characters
    if (!/^[A-Za-z0-9-_]{43}$/.test(decryptedBoxKeyShare)) {
      throw Error('invitation crypto action decrypts to unexpected format');
    }
    const invitationKeyShare = decryptedBoxKeyShare;

    const { misakeyKeyShare } = await fetchMisakeyKeyShare(invitationKeyShare);
    const boxSecretKey = combineBoxKeyShares(invitationKeyShare, misakeyKeyShare);

    await dispatch({
      type: CRYPTO_SET_BOX_SECRETS,
      boxId: cryptoactionBoxId,
      secretKey: boxSecretKey,
      keyShare: invitationKeyShare,
    });

    await dispatch(updateBackup());

    await deleteCryptoaction({ accountId, cryptoactionId });

    const path = generatePath(routes.boxes.read._, { id: notificationBoxId });

    // XXX one would think that after "processAutoInviteCryptoaction"
    // we would not need to append the invitation key share
    // since it should be in the secret backup
    // but for some reason the frontend fails if we don't append it
    // TODO fix this (it works with the invitation key share but it's weird we need it)
    const boxUrl = `${path}#${invitationKeyShare}`;

    return { boxUrl };
  }
);
