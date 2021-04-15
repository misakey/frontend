import {
  symmetricDecrypt,
} from '@misakey/core/crypto/crypto';

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
  } = decryptedContent;

  return symmetricDecrypt(encryptedFile, nonce, fileKey);
};
