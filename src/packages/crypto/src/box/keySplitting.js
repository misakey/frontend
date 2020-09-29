import { getKeyShareBuilder } from '@misakey/helpers/builder/boxes';
import { getCode, getDetails } from '@misakey/helpers/apiError';
import errorTypes from '@misakey/ui/constants/errorTypes';

import { InvalidHash } from '../Errors/classes';
import { splitKey, combineShares, hashShare } from '../crypto/keySplitting';

export function splitBoxSecretKey(key, { boxId }) {
  const {
    userShare: invitationKeyShare,
    misakeyShare: misakeyKeyShare,
  } = splitKey(key);

  misakeyKeyShare.boxId = boxId;

  return {
    invitationKeyShare,
    misakeyKeyShare,
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
