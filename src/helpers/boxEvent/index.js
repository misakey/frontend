import { MSG_DELETE, MSG_EDIT } from 'constants/app/boxes/events';

import prop from '@misakey/helpers/prop';
import path from '@misakey/helpers/path';
import isNil from '@misakey/helpers/isNil';

// HELPERS
const lastEditedAtProp = prop('lastEditedAt');

export const getBoxEventLastDate = ({ content, serverEventCreatedAt }) => {
  const lastEditedAt = lastEditedAtProp(content);

  return lastEditedAt || serverEventCreatedAt;
};

export const isBoxEventEdited = ({ content }) => !isNil(lastEditedAtProp(content));

export const eventKickedMemberIdentifierValuePath = path(['kickedMember', 'identifier', 'value']);

export const transformReferrerEvent = (event) => (referrerEvent) => {
  const { type } = event;
  if (type === MSG_DELETE) {
    return {
      ...referrerEvent,
      content: {
        deleted: {
          atTime: event.serverEventCreatedAt,
          byIdentity: event.sender,
        },
      },
    };
  }
  if (type === MSG_EDIT) {
    const { content } = event;
    return {
      ...referrerEvent,
      content: {
        encrypted: content.newEncrypted,
        publicKey: content.newPublicKey,
        lastEditedAt: event.serverEventCreatedAt,
      },
    };
  }
  return event;
};
