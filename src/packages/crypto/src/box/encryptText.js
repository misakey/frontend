import {
  decodeUTF8,
  encodeBase64,
} from 'tweetnacl-util';

import { asymmetricEncrypt } from '../crypto';

// @FIXME Base64 encoding is not really necessary here
// but it is too disturbing to send stringified JSON.
// One day we will migrate to MessagePack
// (can be done server-side)

export default function (text, boxPublicKey) {
  return encodeBase64(decodeUTF8(
    asymmetricEncrypt(decodeUTF8(text), boxPublicKey),
  ));
}
