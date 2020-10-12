import {
  decodeUTF8,
  encodeBase64,
} from 'tweetnacl-util';

import {
  generateSymmetricKey,
  symmetricEncrypt,
  asymmetricEncrypt,
} from '@misakey/crypto/crypto';

import uint8arrayFromBlob from '@misakey/crypto/helpers/uint8arrayFromBlob';
import blobFromUint8array from '@misakey/crypto/helpers/blobFromUint8array';

/**
 * Encrypts a file
 * and returns all the data required by the `POST /boxes/:id/encrypted-files` endpoint
 * (the encrypted file, the encrypted message content, and the public key that was used).
 *
 * @param {File} file a JS File object (https://developer.mozilla.org/en-US/docs/Web/API/File)
 * @param {string} boxPublicKey the public key of the box this file must be sent to
 */
export default async (file, boxPublicKey) => {
  const fileKey = generateSymmetricKey();

  const bytes = await uint8arrayFromBlob(file);
  const { nonce, ciphertext } = symmetricEncrypt(bytes, fileKey);
  const encryptedFile = blobFromUint8array(ciphertext);

  const messageContentPlainText = {
    encryption: {
      key: fileKey,
      nonce,
    },
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  };

  const encryptedMessageContent = encodeBase64(decodeUTF8(
    asymmetricEncrypt(
      decodeUTF8(JSON.stringify(messageContentPlainText)),
      boxPublicKey,
    ),
  ));

  return {
    encryptedFile,
    encryptedMessageContent,
    publicKey: boxPublicKey,
  };
};
