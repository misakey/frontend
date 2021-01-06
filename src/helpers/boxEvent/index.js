import {
  MSG_DELETE, MSG_EDIT,
  MEMBER_LEAVE, MEMBER_KICK, MEMBER_EVENT_TYPES, MEMBER_JOIN,
  STATE_ACCESS_MODE,
} from 'constants/app/boxes/events';
import { LIMITED } from '@misakey/ui/constants/accessModes';


import prop from '@misakey/helpers/prop';
import path from '@misakey/helpers/path';
import compose from '@misakey/helpers/compose';
import when from '@misakey/helpers/when';
import isObject from '@misakey/helpers/isObject';
import isNil from '@misakey/helpers/isNil';
import findLast from '@misakey/helpers/findLast';
import { senderMatchesIdentityId } from 'helpers/sender';

// HELPERS
const lastEditedAtProp = prop('lastEditedAt');
export const isKickEvent = ({ type }) => type === MEMBER_KICK;

export const isMemberEventType = ({ type }) => MEMBER_EVENT_TYPES.includes(type);

export const getBoxEventLastDate = ({ content, serverEventCreatedAt }) => {
  const lastEditedAt = lastEditedAtProp(content);

  return lastEditedAt || serverEventCreatedAt;
};

export const isBoxEventEdited = ({ content }) => !isNil(lastEditedAtProp(content));

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

export const isMeEvent = (
  { sender }, meIdentityId,
) => senderMatchesIdentityId(sender, meIdentityId);

export const isMeLeaveEvent = ({ type, sender }, meIdentityId) => {
  if (type === MEMBER_LEAVE) {
    return senderMatchesIdentityId(sender, meIdentityId);
  }
  return false;
};

export const isMeKickEvent = ({ type, sender }, meIdentityId) => {
  if (type === MEMBER_KICK) {
    return senderMatchesIdentityId(sender, meIdentityId);
  }
  return false;
};


export const isMeJoinEvent = ({ type, sender }, meIdentityId) => {
  if (type === MEMBER_JOIN) {
    return senderMatchesIdentityId(sender, meIdentityId);
  }
  return false;
};


export const getEventForNormalization = (event) => {
  const { content, serverEventCreatedAt: createdAt, sender } = event;
  if (!isNil(content)) {
    const { encryptedFileId, isSaved = false } = content;
    if (!isNil(encryptedFileId)) {
      const decryptedFile = { id: encryptedFileId, isSaved, sender, createdAt };
      const newContent = { ...content, decryptedFile };
      return { ...event, content: newContent };
    }
  }
  return event;
};

export const getLastAccessMode = (events) => {
  const lastAccessModeEvent = findLast(events, ({ type }) => type === STATE_ACCESS_MODE);
  return isNil(lastAccessModeEvent) ? LIMITED : lastAccessModeEvent.value;
};

export const getEventEncryptedFileId = compose(
  when(isObject, prop('id')),
  path(['content', 'encryptedFileId']),
);

export const getSavedFileEncryptedFileId = compose(
  when(isObject, prop('id')),
  prop('encryptedFileId'),
);
