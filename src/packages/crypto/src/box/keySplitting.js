import { getKeyShareBuilder } from '@misakey/helpers/builder/boxes';
import { getCode, getDetails } from '@misakey/helpers/apiError';
import errorTypes from '@misakey/ui/constants/errorTypes';

import { InvalidHash } from '@misakey/crypto/Errors/classes';
import { splitKey, combineShares, hashShare } from '@misakey/crypto/crypto/keySplitting';
import { encryptCryptoaction } from '@misakey/crypto/cryptoactions';

export function splitBoxSecretKey({ boxSecretKey, boxPublicKey }) {
  const {
    userShare,
    // XXX naming of shares is not very consistent
    // from one part of the code to the other
    // TODO fix this as part of refacto (https://gitlab.misakey.dev/misakey/frontend/-/issues/856)
    misakeyShare: {
      share: misakeyShare,
      otherShareHash,
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
      otherShareHash,
      encryptedInvitationKeyShare,
    },
  };
}

export const computeInvitationHash = (invitationKeyShare) => hashShare(invitationKeyShare);

export const combineBoxKeyShares = (invitationKeyShare, misakeyKeyShare) => (
  combineShares(invitationKeyShare, misakeyKeyShare)
);

// CONSTANTS
const { notFound } = errorTypes;

export async function fetchMisakeyKeyShare(invitationKeyShare) {
  const otherShareHash = computeInvitationHash(invitationKeyShare);
  try {
    const misakeyKeyShare = await getKeyShareBuilder(otherShareHash);
    return { misakeyKeyShare, invitationKeyShare };
  } catch (error) {
    const code = getCode(error);
    const { otherShareHash: errorOtherShareHash } = getDetails(error);
    if (code === notFound && errorOtherShareHash === notFound) {
      throw new InvalidHash();
    }
    throw error;
  }
}
