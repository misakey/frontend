// We exceptionnaly import functions from the crypto core
// and other low-level functions
// because the backup key is not base64-encoded
// (since it is never sent through the network)
import { hash } from 'tweetnacl';
import { share, combine } from '../crypto/core/secretSharing';
import { encodeBase64, decodeBase64 } from '../helpers/base64';

const hashBinaryShare = (theShare) => (
  encodeBase64(hash(theShare), { urlSafe: true })
);

export function splitBackupKey(key, { accountId }) {
  const { shareOne, shareTwo } = share(key.symmetricKey);

  return {
    localBackupKeyShare: encodeBase64(shareOne, { urlSafe: true }),
    misakeyBackupKeyShare: {
      share: encodeBase64(shareTwo, { urlSafe: false }),
      otherShareHash: hashBinaryShare(shareOne),
      accountId,
    },
  };
}

export const computeOtherShareHash = (localBackupKeyShare) => (
  hashBinaryShare(decodeBase64(localBackupKeyShare, { urlSafe: true }))
);

export const combineBackupKeyShares = (localBackupKeyShare, misakeyKeyShare) => {
  const keyBytes = combine(
    decodeBase64(localBackupKeyShare, { urlSafe: true }),
    decodeBase64(misakeyKeyShare.share, { urlSafe: false }),
  );

  return encodeBase64(keyBytes, { urlSafe: true });
};
