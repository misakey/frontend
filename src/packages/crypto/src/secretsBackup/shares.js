import { hash } from 'tweetnacl';

import { encodeBase64, decodeBase64 } from '../helpers/base64';

import { share, combine } from '../crypto/secretSharing';

function hashShare(backupKeyShare) {
  return encodeBase64(hash(backupKeyShare), { urlSafe: true });
}

export function splitBackupKey({ symmetricKey }, { accountId }) {
  const { shareOne, shareTwo } = share(symmetricKey);

  return {
    localBackupKeyShare: encodeBase64(shareOne, { urlSafe: true }),
    misakeyBackupKeyShare: {
      share: encodeBase64(shareTwo, { urlSafe: false }),
      otherShareHash: hashShare(shareOne),
      accountId,
    },
  };
}

export function computeOtherShareHash(backupKeyShare) {
  return hashShare(
    decodeBase64(backupKeyShare, { urlSafe: true }),
  );
}

export function combineShares(localBackupKeyShare, misakeyKeyShare) {
  const backupKey = combine(
    decodeBase64(localBackupKeyShare, { urlSafe: true }),
    decodeBase64(misakeyKeyShare.share, { urlSafe: false }),
  );

  return encodeBase64(backupKey, { urlSafe: true });
}
