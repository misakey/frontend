import {
  decodeBase64,
  encodeUTF8,
} from 'tweetnacl-util';

import {
  asymmetricDecrypt,
} from '../crypto';

export default function (encryptedMessageContent, boxSecretKey) {
  return JSON.parse(encodeUTF8(
    asymmetricDecrypt(
      encodeUTF8(decodeBase64(encryptedMessageContent)),
      boxSecretKey,
    ),
  ));
}
