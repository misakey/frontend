import { computeInvitationHash } from '@misakey/crypto/box/keySplitting';
import { getKeyShareBuilder } from '@misakey/helpers/builder/boxes';
import { InvalidHash } from '@misakey/crypto/Errors/classes';
import { getCode, getDetails } from '@misakey/helpers/apiError';
import errorTypes from '@misakey/ui/constants/errorTypes';

// CONSTANTS
const { notFound } = errorTypes;

// HELPERS
export default (shareHash) => {
  try {
    const keyShare = computeInvitationHash(shareHash);
    return getKeyShareBuilder(keyShare)
      .then((misakeyKeyShare) => ({ misakeyKeyShare, otherShareHash: shareHash }))
      .catch((error) => {
        const code = getCode(error);
        const { otherShareHash } = getDetails(error);
        if (code === notFound && otherShareHash === notFound) {
          throw new InvalidHash();
        }
        throw error;
      });
  } catch (error) {
    return Promise.reject(new InvalidHash());
  }
};
