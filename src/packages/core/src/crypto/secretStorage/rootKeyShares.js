// We use key splitting on the root key (the key that encrypts/decrypts the secret root)
// so that we can store one key share in local storage
// which enables to re-build the root key when needed without re-prompting for password
// and is safer than storing the root key directly in local storage.
// Note that actions related to root key splitting are located in
// @misakey/react/crypto/store/actions
// (XXX: move them to this directory?)

// We exceptionnaly import functions from the crypto core
// and other low-level functions
// because the root key is not base64-encoded
// (since it is never sent through the network)
import { hash } from 'tweetnacl';

// XXX why not using src/packages/crypto/src/crypto/keySplitting.js?
// (see https://gitlab.misakey.dev/misakey/frontend/-/issues/856)
// (note that `keySplitting.js` uses the term "misakey share" instead of just "share" now though)
import { share, combine } from '../crypto/core/secretSharing';
import { encodeBase64, decodeBase64 } from '../helpers/base64';

const hashBinaryShare = (theShare) => (
  encodeBase64(hash(theShare), { urlSafe: true })
);

export function splitRootKey(key, { accountId }) {
  const keyBytes = decodeBase64(key, { urlSafe: true });

  const { shareOne, shareTwo } = share(keyBytes);

  return {
    localRootKeyShare: encodeBase64(shareOne, { urlSafe: true }),
    misakeyRootKeyShare: {
      share: encodeBase64(shareTwo, { urlSafe: true }),
      userLocalShareHash: hashBinaryShare(shareOne),
      accountId,
    },
  };
}

export const computeUserLocalShareHash = (localRootKeyShare) => (
  hashBinaryShare(decodeBase64(localRootKeyShare, { urlSafe: true }))
);

export const combineRootKeyShares = (localRootKeyShare, misakeyKeyShare) => {
  const keyBytes = combine(
    decodeBase64(localRootKeyShare, { urlSafe: true }),
    decodeBase64(misakeyKeyShare.share, { urlSafe: true }),
  );

  return encodeBase64(keyBytes, { urlSafe: true });
};
