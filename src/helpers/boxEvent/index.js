import { MSG_EDIT, MSG_DELETE } from 'constants/app/boxes/events';

import { createBoxEventBuilder } from '@misakey/helpers/builder/boxes';
import encryptText from '@misakey/crypto/box/encryptText';
import prop from '@misakey/helpers/prop';
import isNil from '@misakey/helpers/isNil';

// HELPERS
const lastEditedAtProp = prop('lastEditedAt');

export const getBoxEventLastDate = ({ content, serverEventCreatedAt }) => {
  const lastEditedAt = lastEditedAtProp(content);

  return lastEditedAt || serverEventCreatedAt;
};

export const isBoxEventEdited = ({ content }) => !isNil(lastEditedAtProp(content));

export const deleteBoxEventBuilder = ({ boxId, eventId }) => {
  const event = {
    type: MSG_DELETE,
    content: {
      eventId,
    },
  };
  return createBoxEventBuilder(boxId, event);
};

export const editBoxEventTextBuilder = ({
  publicKey, boxId, eventId, value,
}) => createBoxEventBuilder(boxId, {
  type: MSG_EDIT,
  content: {
    eventId,
    newEncrypted: encryptText(value, publicKey),
    newPublicKey: publicKey,
  },
});
