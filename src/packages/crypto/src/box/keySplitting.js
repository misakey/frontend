import { hash } from 'tweetnacl';

import { encodeBase64, decodeBase64 } from '../helpers/base64';

import { share, combine } from '../crypto/secretSharing';

function invitationHash(invitationShare) {
  return encodeBase64(hash(invitationShare), { urlSafe: true });
}

export function splitBoxSecretKey(key, { boxId }) {
  // @FIXME there should only be one place
  // where we declare the encoding used for a box secret key
  // (or for any other type).
  // I am considering starting to use classes
  // so that crypto values are in binary form everywhere in the code
  // but thet carry their own `toString` method
  // which will be called implicitly by the application code
  // when they have to be sent through the network.
  // But this will be done later.
  const { shareOne, shareTwo } = share(decodeBase64(key, { urlSafe: true }));

  return {
    invitationKeyShare: encodeBase64(shareOne, { urlSafe: true }),
    misakeyKeyShare: {
      share: encodeBase64(shareTwo, { urlSafe: false }),
      otherShareHash: invitationHash(shareOne),
      boxId,
    },
  };
}

export function computeInvitationHash(invitationKeyShare) {
  return invitationHash(
    decodeBase64(invitationKeyShare, { urlSafe: true }),
  );
}

export function combineShares(invitationKeyShare, misakeyKeyShare) {
  const boxSecretKey = combine(
    decodeBase64(invitationKeyShare, { urlSafe: true }),
    decodeBase64(misakeyKeyShare.share, { urlSafe: false }),
  );

  return encodeBase64(boxSecretKey, { urlSafe: true });
}
