import { PORTABILITY, ERASURE } from 'constants/databox/type';

export const OTHER_CHANNEL = 'other_channel';
export const DONE = 'done';
export const REFUSED = 'refused';
export const NO_DATA = 'no_data';


export const OWNER_COMMENTS = {
  [ERASURE]: [
    DONE,
    NO_DATA,
    REFUSED,
  ],
  [PORTABILITY]: [
    OTHER_CHANNEL,
    NO_DATA,
    REFUSED,
    DONE,
  ],
};

export const DPO_COMMENTS = [
  DONE,
  NO_DATA,
  REFUSED,
];
