import {
  decodeUTF8,
  encodeBase64,
} from 'tweetnacl-util';

import { asymmetricEncrypt } from '@misakey/crypto/crypto';
import { encryptFile } from '@misakey/crypto/files';

/**
 * Encrypts a file
 * and returns all the data required by the `POST /boxes/:id/encrypted-files` endpoint
 * (the encrypted file, the encrypted message content, and the public key that was used).
 *
 * @param {File} file a JS File object (https://developer.mozilla.org/en-US/docs/Web/API/File)
 * @param {string} boxPublicKey the public key of the box this file must be sent to
 */
export default async (file, boxPublicKey) => {
  const {
    metaData: messageContentPlainText,
    encryptedFile,
  } = await encryptFile(file);

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
