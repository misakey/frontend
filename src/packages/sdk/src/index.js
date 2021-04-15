const mime = require('mime-types');

const { default: isArray } = require('@misakey/core/helpers/isArray');

const { createCryptoForNewBox } = require('@misakey/core/crypto/box/creation');
const { default: encryptText } = require('@misakey/core/crypto/box/encryptText');
const { default: encryptFile } = require('@misakey/core/crypto/box/encryptFile');

const httpApi = require('./httpApi');

async function createBox({ title, dataSubject, dataTag, orgId, accessToken }) {
  const datatagId = await httpApi.getDataTagID(dataTag, accessToken);

  const {
    boxPublicKey,
    invitationKeyShare,
    misakeyKeyShare,
  } = createCryptoForNewBox();

  const box = await httpApi.postBox({
    orgId,
    dataSubject,
    datatagId,
    publicKey: boxPublicKey,
    keyShare: misakeyKeyShare,
    accessToken,
    title,
  });

  return {
    boxId: box.id,
    datatagId,
    boxPublicKey,
    invitationKeyShare,
  };
}

class Misakey {
  constructor(orgId, authSecret) {
    this.orgId = orgId;
    this.authSecret = authSecret;
    this.accessToken = null;
  }

  async pushMessages({ messages, boxTitle, dataSubject, dataTag }) {
    if (!isArray(messages)) {
      throw Error('messages must be an array');
    }

    if (!this.accessToken) {
      this.accessToken = await httpApi.exchangeToken(this.orgId, this.authSecret);
    }

    const {
      boxId,
      datatagId,
      boxPublicKey,
      invitationKeyShare,
    } = await createBox({
      title: boxTitle,
      dataSubject,
      dataTag,
      orgId: this.orgId,
      accessToken: this.accessToken,
    });

    // We want to upload the messages sequentially,
    // so we're using `await` in a for loop.
    /* eslint-disable no-restricted-syntax, no-await-in-loop */
    for (const message of messages) {
      if (typeof message === 'string') {
        const encryptedMessageContent = encryptText(message, boxPublicKey);

        await httpApi.postTextMessage({
          encryptedMessageContent,
          boxId,
          boxPublicKey,
          accessToken: this.accessToken,
        });
      } else {
        const { data, filename } = message;

        const fileType = mime.lookup(filename);
        const fileSize = data.length;
        const {
          encryptedFile,
          encryptedMessageContent,
        } = await encryptFile(data, boxPublicKey, filename, fileType, fileSize);

        await httpApi.postFileMessage(
          encryptedFile,
          filename,
          encryptedMessageContent,
          boxId,
          boxPublicKey,
          this.accessToken,
        );
      }
    }
    /* eslint-enable no-restricted-syntax, no-await-in-loop */

    return {
      boxId,
      datatagId,
      invitationLink: `https://app.${httpApi.BASE_TARGET_DOMAIN}/boxes/${boxId}#${invitationKeyShare}`,
    };
  }
}

module.exports = Misakey;
