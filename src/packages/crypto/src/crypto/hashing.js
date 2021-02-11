import { hash as naclHash } from 'tweetnacl';
import { encodeBase64, decodeBase64 } from '@misakey/crypto/helpers/base64';


export function hash(data, { urlSafeInput = true, urlSafeOutput = true } = {}) {
  const bytes = decodeBase64(data, { urlSafe: urlSafeInput });
  const digest = naclHash(bytes);
  return encodeBase64(digest, { urlSafe: urlSafeOutput });
}
