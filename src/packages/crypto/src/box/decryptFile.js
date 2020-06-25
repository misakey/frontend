import {
  symmetricDecrypt,
} from '../crypto';

import uint8arrayFromBlob from '../helpers/uint8arrayFromBlob';
import blobFromUint8array from '../helpers/blobFromUint8array';

/**
 * Input `decryptedContent` is typically obtained with function `decryptFileMsg`
 * (see file `decryptFileMsg.js`)
 */
export default async function (encryptedFile, decryptedContent) {
  const {
    encryption: {
      key: fileKey,
      nonce,
    },
    fileName,
  } = decryptedContent;

  const ciphertext = await uint8arrayFromBlob(encryptedFile);
  const plaintext = symmetricDecrypt(ciphertext, nonce, fileKey);

  const file = new File(
    [blobFromUint8array(plaintext)],
    fileName,
  );

  return file;
}
