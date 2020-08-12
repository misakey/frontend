import { hash } from 'tweetnacl';
import { encodeBase64, decodeBase64 } from '../helpers/base64';

export const computeVaultKeyFingerprint = (vaultKey) => (
  encodeBase64(
    hash(
      decodeBase64(
        vaultKey,
        { urlSafe: true },
      ),
    ),
    { urlSafe: true },
  )
);
