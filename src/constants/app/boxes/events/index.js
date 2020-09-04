export const CREATE = 'create';
export const LIFECYCLE = 'state.lifecycle';
export const MEMBER_JOIN = 'member.join';
export const MEMBER_LEAVE = 'member.leave';
export const MSG_FILE = 'msg.file';
export const MSG_TXT = 'msg.text';
export const MSG_DELETE = 'msg.delete';
export const MSG_EDIT = 'msg.edit';

const EVENT_TYPES_BY_KIND = {
  information: [CREATE, LIFECYCLE, MEMBER_JOIN, MEMBER_LEAVE],
  message: [MSG_FILE, MSG_TXT],
};

export const ALL_EVENT_TYPES = EVENT_TYPES_BY_KIND.information.concat(EVENT_TYPES_BY_KIND.message);

export const EDITABLE_EVENT_TYPES = MSG_TXT;

export const DELETABLE_EVENT_TYPES = EVENT_TYPES_BY_KIND.message;

export default EVENT_TYPES_BY_KIND;
