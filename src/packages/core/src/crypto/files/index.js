import {
  generateSymmetricKey,
  symmetricEncrypt,
} from '@misakey/core/crypto/crypto';

/**
 * Encrypts a file with generated symmetricKey
 * and returns encrypted file and file metadata
 * method used by `encrypt file for box` and `encrypt file for vault` methods
 * @param {File} file a JS File object (https://developer.mozilla.org/en-US/docs/Web/API/File)
*/
export const encryptFile = async (fileBytes, fileName, fileType, fileSize) => {
  const fileKey = generateSymmetricKey();

  const { nonce, ciphertext } = symmetricEncrypt(fileBytes, fileKey);

  const metaData = {
    encryption: {
      key: fileKey,
      nonce,
    },
    fileName,
    fileSize,
    fileType,
  };

  return {
    encryptedFile: ciphertext,
    metaData,
  };
};
