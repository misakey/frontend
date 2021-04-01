import {
  encodeUTF8,
} from 'tweetnacl-util';

import { decodeBase64 } from '@misakey/core/crypto/helpers/base64';


import {
  asymmetricDecrypt,
} from '../crypto';

export default function decryptFileMsg(encryptedMessageContent, boxSecretKey) {
  return JSON.parse(encodeUTF8(
    asymmetricDecrypt(
      encodeUTF8(decodeBase64(encryptedMessageContent)),
      boxSecretKey,
    ),
  ));
}
