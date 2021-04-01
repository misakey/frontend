import {
  encodeUTF8,
} from 'tweetnacl-util';

import { decodeBase64 } from '@misakey/core/crypto/helpers/base64';

import { asymmetricDecrypt } from '../crypto';

// @FIXME Base64 encoding is not really necessary here
// but it is too disturbing to send stringified JSON.
// One day we will migrate to MessagePack
// (can be done server-side)

export default function decryptText(encrypted, boxSecretKey) {
  return encodeUTF8(asymmetricDecrypt(
    encodeUTF8(decodeBase64(encrypted)),
    boxSecretKey,
  ));
}
