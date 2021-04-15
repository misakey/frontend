import {
  decodeUTF8,
} from 'tweetnacl-util';

import { encodeBase64 } from '@misakey/core/crypto/helpers/base64';

import { asymmetricEncrypt } from '@misakey/core/crypto/crypto';
import { encryptFile } from '@misakey/core/crypto/files';

/**
 * Encrypts a file
 * and returns all the data required by the `POST /boxes/:id/encrypted-files` endpoint
 * (the encrypted file, the encrypted message content, and the public key that was used).
 *
 * @param {string} boxPublicKey the public key of the box this file must be sent to
 */
export default async (fileBytes, boxPublicKey, fileName, fileType, fileSize) => {
  const {
    metaData: messageContentPlainText,
    encryptedFile,
  } = await encryptFile(fileBytes, fileName, fileType, fileSize);

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
