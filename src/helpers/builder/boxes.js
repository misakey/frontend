import { MEMBER_LEAVE } from 'constants/app/boxes/events';

import { createBoxEventBuilder } from '@misakey/helpers/builder/boxes';

export const createLeaveBoxEventBuilder = (id) => createBoxEventBuilder(id, {
  type: MEMBER_LEAVE,
});
