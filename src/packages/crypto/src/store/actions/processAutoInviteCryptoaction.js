import { generatePath } from 'react-router-dom';

import routes from 'routes';

import { getCode } from '@misakey/helpers/apiError';
import { notFound } from '@misakey/ui/constants/errorTypes';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import { decryptCryptoaction } from '@misakey/crypto/cryptoactions';
import {
  getCryptoaction,
  deleteCryptoaction,
  getEncryptedBoxKeyShare,
} from '@misakey/crypto/HttpApi';
import {
  decryptEncryptedBoxKeyShare,
} from '@misakey/crypto/box/keySplitting';

import { selectors as cryptoSelectors } from '@misakey/crypto/store/reducers';

import updateBackup from './updateBackup';
import { CRYPTO_SET_BOX_SECRETS } from './types';

// CONSTANTS
const {
  accountId: selectAccountId,
} = authSelectors;

const { getRelatedIdentitySecretKey: getRelatedIdentitySecretKeySelector } = cryptoSelectors;

// THUNK
export default ({ cryptoactionId, boxId: notificationBoxId }) => (
  async (dispatch, getState) => {
    const state = getState();

    const accountId = selectAccountId(state);

    const cryptoaction = await getCryptoaction({ accountId, cryptoactionId });
    const { encrypted, encryptionPublicKey, boxId: cryptoactionBoxId } = cryptoaction;

    if (notificationBoxId !== cryptoactionBoxId) {
      throw Error(`box ID is not the same in notification (${notificationBoxId}) and in cryptoaction ${cryptoactionBoxId}`);
    }

    const boxId = notificationBoxId;

    const secretKey = getRelatedIdentitySecretKeySelector(state, encryptionPublicKey);
    const decryptedCryptoaction = decryptCryptoaction(encrypted, secretKey);
    const { boxSecretKey } = decryptedCryptoaction;

    let decryptedBoxKeyShare;
    try {
      const encryptedBoxKeyShare = await getEncryptedBoxKeyShare(boxId);
      // Backend is supposed to return a HTTP 404 not found if there is no encrypted box key share
      // but right now it is returning `null`, so in this case we “mimic” a HTTP 404 error
      if (encryptedBoxKeyShare === null) {
        const error = new Error('encrypted Box key share is null');
        error.code = notFound;
        throw error;
      }
      decryptedBoxKeyShare = decryptEncryptedBoxKeyShare({ encryptedBoxKeyShare, boxSecretKey });
    } catch (error) {
      if (getCode(error) === notFound) {
        // It is possible that a box does not have an “encrypted box secret share”
        // if it was created some time ago and its secret share was not modified since then;
        // in this case we use the box key share that's in the cryptoaction:
        // it should be valid since if it was changed it should have an encrypted box key share.
        //
        // TODO remove when there are no more boxes in production
        // that don't have an encrypted box key share
        ({ boxKeyShare: decryptedBoxKeyShare } = decryptedCryptoaction);
      } else {
        throw error;
      }
    }

    // we expect a box key share encoded as unpadded url-safe base64.
    // box key share is 32 bytes so ceil(32*8/6)=43 base64 characters
    if (!/^[A-Za-z0-9-_]{43}$/.test(decryptedBoxKeyShare)) {
      throw Error('invitation crypto action decrypts to unexpected format');
    }
    const invitationKeyShare = decryptedBoxKeyShare;

    await dispatch({
      type: CRYPTO_SET_BOX_SECRETS,
      boxId: cryptoactionBoxId,
      secretKey: boxSecretKey,
      keyShare: invitationKeyShare,
    });

    await dispatch(updateBackup());

    await deleteCryptoaction({ accountId, cryptoactionId });

    const path = generatePath(routes.boxes.read._, { id: notificationBoxId });

    return { boxUrl: path };
  }
);
