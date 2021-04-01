import makeFileOrBlob from '@misakey/core/helpers/makeFileOrBlob';
import {
  symmetricDecrypt,
} from '@misakey/core/crypto/crypto';

import uint8arrayFromBlob from '@misakey/core/crypto/helpers/uint8arrayFromBlob';
import blobFromUint8array from '@misakey/core/crypto/helpers/blobFromUint8array';

/**
 * Input `decryptedContent` is typically obtained with function `decryptFileMsg`
 * (see file `decryptFileMsg.js`)
 */
export default async (encryptedFile, decryptedContent) => {
  const {
    encryption: {
      key: fileKey,
      nonce,
    },
    fileName,
  } = decryptedContent;

  const ciphertext = await uint8arrayFromBlob(encryptedFile);
  const plaintext = symmetricDecrypt(ciphertext, nonce, fileKey);

  return makeFileOrBlob([blobFromUint8array(plaintext)], fileName);
};
