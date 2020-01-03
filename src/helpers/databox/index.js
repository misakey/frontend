import moment from 'moment';

import { DELAY_REOPEN_DAYS } from 'constants/databox/delay';
import { CLOSED } from 'constants/databox/status';

import isEmpty from '@misakey/helpers/isEmpty';
import head from '@misakey/helpers/head';

export const isClosedDelayDone = (databox) => databox.status === CLOSED
  && moment().diff(databox.createdAt, 'days') > DELAY_REOPEN_DAYS;


export const getCurrentDatabox = (databoxes) => {
  if (isEmpty(databoxes)) {
    return null;
  }
  const first = head(databoxes);
  if (first.status !== CLOSED) {
    return first;
  }
  return isClosedDelayDone(first) ? null : first;
};
