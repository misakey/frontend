import { getKeyShareBuilder } from '@misakey/helpers/builder/boxes';
import { getCode, getDetails } from '@misakey/helpers/apiError';
import { notFound } from '@misakey/ui/constants/errorTypes';

import { InvalidHash } from '@misakey/crypto/Errors/classes';
import { splitKey, combineShares, hashShare } from '@misakey/crypto/crypto/keySplitting';
import { encryptCryptoaction, decryptCryptoaction } from '@misakey/crypto/cryptoactions';

// HELPERS
export function splitBoxSecretKey({ boxSecretKey, boxPublicKey }) {
  const {
    userShare,
    // XXX naming of shares is not very consistent
    // from one part of the code to the other
    // TODO fix this as part of refacto (https://gitlab.misakey.dev/misakey/frontend/-/issues/856)
    misakeyShare: {
      misakeyShare,
      userShareHash: invitationShareHash,
    },
  } = splitKey(boxSecretKey);

  // field `encryptedInvitationKeyShare` will be used both as a cryptoaction
  // (for current members of the box)
  // and as a box attribute
  // (for users being invited to the box)
  const encryptedInvitationKeyShare = encryptCryptoaction(
    { boxKeyShare: userShare },
    boxPublicKey,
  );

  return {
    invitationKeyShare: userShare,
    // reproducing the structure used in the HTTP API
    // TODO (in refacto later) fix naming about key shares
    misakeyKeyShare: {
      misakeyShare,
      invitationShareHash,
      encryptedInvitationKeyShare,
    },
  };
}

export function decryptEncryptedBoxKeyShare({ encryptedBoxKeyShare, boxSecretKey }) {
  const { boxKeyShare } = decryptCryptoaction(encryptedBoxKeyShare, boxSecretKey);
  return boxKeyShare;
}

export const computeInvitationHash = (invitationKeyShare) => hashShare(invitationKeyShare);

export const combineBoxKeyShares = (invitationKeyShare, misakeyKeyShare) => (
  combineShares(invitationKeyShare, misakeyKeyShare)
);

export async function fetchMisakeyKeyShare(invitationKeyShare) {
  const invitationShareHash = computeInvitationHash(invitationKeyShare);
  try {
    const misakeyKeyShare = await getKeyShareBuilder(invitationShareHash);
    return { misakeyKeyShare, invitationKeyShare };
  } catch (error) {
    const code = getCode(error);
    const { invitationShareHash: errorInvitationShareHash } = getDetails(error);
    if (code === notFound && errorInvitationShareHash === notFound) {
      throw new InvalidHash();
    }
    throw error;
  }
}
