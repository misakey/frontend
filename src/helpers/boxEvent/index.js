import { MSG_DELETE, MSG_EDIT, MEMBER_LEAVE, MEMBER_KICK, MEMBER_EVENT_TYPES, MEMBER_JOIN } from 'constants/app/boxes/events';

import prop from '@misakey/helpers/prop';
import isNil from '@misakey/helpers/isNil';
import { senderMatchesIdentifierId } from 'helpers/sender';

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
  { sender }, meIdentifierId,
) => senderMatchesIdentifierId(sender, meIdentifierId);

export const isMeLeaveEvent = ({ type, sender }, meIdentifierId) => {
  if (type === MEMBER_LEAVE) {
    return senderMatchesIdentifierId(sender, meIdentifierId);
  }
  return false;
};

export const isMeKickEvent = ({ type, sender }, meIdentifierId) => {
  if (type === MEMBER_KICK) {
    return senderMatchesIdentifierId(sender, meIdentifierId);
  }
  return false;
};


export const isMeJoinEvent = ({ type, sender }, meIdentifierId) => {
  if (type === MEMBER_JOIN) {
    return senderMatchesIdentifierId(sender, meIdentifierId);
  }
  return false;
};
