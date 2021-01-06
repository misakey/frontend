export const CREATE = 'create';
export const KEY_SHARE = 'state.key_share';
export const STATE_ACCESS_MODE = 'state.access_mode';
export const MEMBER_JOIN = 'member.join';
export const MEMBER_LEAVE = 'member.leave';
export const MEMBER_KICK = 'member.kick';
export const MSG_FILE = 'msg.file';
export const MSG_TXT = 'msg.text';
export const MSG_DELETE = 'msg.delete';
export const MSG_EDIT = 'msg.edit';
export const ACCESS_BULK = 'accesses';
export const ACCESS_ADD = 'access.add';
export const ACCESS_RM = 'access.rm';

const EVENT_TYPES_BY_KIND = {
  information: [CREATE, MEMBER_JOIN, MEMBER_LEAVE, MEMBER_KICK, KEY_SHARE],
  message: [MSG_FILE, MSG_TXT],
};

export const VISIBLE_EVENTS_TYPES = EVENT_TYPES_BY_KIND.information
  .concat(EVENT_TYPES_BY_KIND.message);

export const CHANGE_EVENT_TYPES = [MSG_DELETE, MSG_EDIT];

export const ACCESS_EVENT_TYPES = [ACCESS_ADD, ACCESS_RM];

export const MEMBER_EVENT_TYPES = [MEMBER_JOIN, MEMBER_LEAVE, MEMBER_KICK];

export const ALL_EVENT_TYPES = VISIBLE_EVENTS_TYPES
  .concat(CHANGE_EVENT_TYPES)
  .concat(ACCESS_EVENT_TYPES);

export const EDITABLE_EVENT_TYPES = MSG_TXT;

export const DELETABLE_EVENT_TYPES = EVENT_TYPES_BY_KIND.message;

export default EVENT_TYPES_BY_KIND;
