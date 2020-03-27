import moment from 'moment';

import { DELAY_REOPEN_DAYS } from 'constants/databox/delay';
import { CLOSED, OPEN, REOPEN } from 'constants/databox/status';

import isEmpty from '@misakey/helpers/isEmpty';
import isObject from '@misakey/helpers/isObject';
import head from '@misakey/helpers/head';
import sort from '@misakey/helpers/sort';

/**
 * curried method that sorts databoxes by following rule
 * open databox first (assumption: there can only be 1)
 * other databoxes sorted by `updatedAt` from most recent to oldest date
 * see Array.sort spec for details on return values in algo https://www.w3schools.com/js/js_array_sort.asp
 * @returns {Function([])} sortDataboxes(list)
 */
export const sortDataboxes = sort((databoxA, databoxB) => {
  if (databoxA.status === OPEN) {
    return -1;
  }
  if (databoxB.status === OPEN) {
    return 1;
  }
  if (moment(databoxA.createdAt).isAfter(databoxB.createdAt)) {
    return -1;
  }
  return 1;
});

export const isClosedDelayDone = (databox) => databox.status === CLOSED
  && moment().diff(databox.createdAt, 'days') > DELAY_REOPEN_DAYS;


export const getCurrentDatabox = (databoxes, requiresSort = true) => {
  if (isEmpty(databoxes)) {
    return null;
  }
  const sortedDataboxes = requiresSort === true
    ? sortDataboxes(databoxes)
    : databoxes;

  const first = head(sortedDataboxes);
  if (first.status !== CLOSED) {
    return first;
  }
  return null;
};

export const isReopen = ({
  status,
  createdAt,
  updatedAt,
  sentAt,
}) => status === OPEN && moment(updatedAt).isAfter(sentAt || createdAt);

export const getStatus = (databox) => {
  if (!isObject(databox)) {
    return null;
  }
  if (isReopen(databox)) {
    return REOPEN;
  }
  return databox.status;
};
