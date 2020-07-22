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
