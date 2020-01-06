import moment from 'moment';

import { DELAY_REOPEN_DAYS } from 'constants/databox/delay';
import { CLOSED, OPEN, REOPEN } from 'constants/databox/status';

import isEmpty from '@misakey/helpers/isEmpty';
import isObject from '@misakey/helpers/isObject';
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

export const isReopen = ({
  status,
  createdAt,
  updatedAt,
}) => status === OPEN && moment(updatedAt).isAfter(createdAt);

export const getStatus = (databox) => {
  if (!isObject(databox)) {
    return null;
  }
  if (isReopen(databox)) {
    return REOPEN;
  }
  return databox.status;
};
