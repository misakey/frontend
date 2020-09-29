import { MSG_DELETE, MSG_EDIT, MEMBER_LEAVE, MEMBER_KICK, MEMBER_EVENT_TYPES } from 'constants/app/boxes/events';

import prop from '@misakey/helpers/prop';
import path from '@misakey/helpers/path';
import isNil from '@misakey/helpers/isNil';
import { identifierValuePath } from 'helpers/sender';

// HELPERS
const lastEditedAtProp = prop('lastEditedAt');
export const isKickEvent = ({ type }) => type === MEMBER_KICK;

export const isMemberEventType = ({ type }) => MEMBER_EVENT_TYPES.includes(type);

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

export const isMeLeaveEvent = ({ type, sender }, meIdentifierValue) => {
  if (type === MEMBER_LEAVE) {
    const senderIdentifierValue = identifierValuePath(sender);
    return senderIdentifierValue === meIdentifierValue;
  }
  return false;
};

export const isMeKickEvent = ({ type, content }, meIdentifierValue) => {
  if (type === MEMBER_KICK) {
    const kickedMemberIdentifierValue = eventKickedMemberIdentifierValuePath(content);
    return kickedMemberIdentifierValue === meIdentifierValue;
  }
  return false;
};
