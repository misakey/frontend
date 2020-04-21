export const DONE = 'done';
export const OTHER_CHANNEL_SATISFIED = 'other_channel_satisfied';
export const OTHER_CHANNEL_UNSATISFIED = 'other_channel_unsatisfied';
export const NO_DATA = 'no_data';
export const IDENTIFICATION_CLARIFICATION_UNWISHED = 'identification_clarification_unwished';
export const PROCEDURE_UNWISHED = 'procedure_unwished';
export const MISUNDERSTOOD = 'misunderstood';
export const NOT_ANSWERED = 'not_answered';
export const UNDISCLOSED = 'undisclosed';
export const OTHER = 'other';

// @FIXME Retrocompatibility values
export const OTHER_CHANNEL = 'other_channel';
export const REFUSED = 'refused';

// @FIXME change when retrocompatibility no more required
export const NEW_OWNER_COMMENTS = [
  // data received
  DONE,
  OTHER_CHANNEL_SATISFIED,
  OTHER_CHANNEL_UNSATISFIED,
  NO_DATA,
  // data not received
  IDENTIFICATION_CLARIFICATION_UNWISHED,
  PROCEDURE_UNWISHED,
  MISUNDERSTOOD,
  NOT_ANSWERED,
  // other cases
  UNDISCLOSED,
  OTHER,
];

const RETROCOMPAT_OWNER_COMMENTS = [
  REFUSED,
  OTHER_CHANNEL,
];

export const OWNER_COMMENTS = [
  ...NEW_OWNER_COMMENTS,
  ...RETROCOMPAT_OWNER_COMMENTS,
];

export const DPO_COMMENTS = [
  DONE,
  NO_DATA,
  REFUSED,
];
