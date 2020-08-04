export const CREATE = 'create';
export const LIFECYCLE = 'state.lifecycle';
export const JOIN = 'join';
export const MSG_FILE = 'msg.file';
export const MSG_TXT = 'msg.text';

const EVENT_TYPES_BY_KIND = {
  information: [CREATE, LIFECYCLE, JOIN],
  message: [MSG_FILE, MSG_TXT],
};

export const ALL_EVENT_TYPES = EVENT_TYPES_BY_KIND.information.concat(EVENT_TYPES_BY_KIND.message);

export default EVENT_TYPES_BY_KIND;
