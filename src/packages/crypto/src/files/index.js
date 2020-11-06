import {
  generateSymmetricKey,
  symmetricEncrypt,
} from '@misakey/crypto/crypto';

import uint8arrayFromBlob from '@misakey/crypto/helpers/uint8arrayFromBlob';
import blobFromUint8array from '@misakey/crypto/helpers/blobFromUint8array';

/**
 * Encrypts a file with generated symmetricKey
 * and returns encrypted file and file metadata
 * method used by `encrypt file for box` and `encrypt file for vault` methods
 * @param {File} file a JS File object (https://developer.mozilla.org/en-US/docs/Web/API/File)
*/
export const encryptFile = async (file) => {
  const fileKey = generateSymmetricKey();

  const bytes = await uint8arrayFromBlob(file);
  const { nonce, ciphertext } = symmetricEncrypt(bytes, fileKey);
  const encryptedFile = blobFromUint8array(ciphertext);

  const metaData = {
    encryption: {
      key: fileKey,
      nonce,
    },
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  };

  return {
    encryptedFile,
    metaData,
  };
};
