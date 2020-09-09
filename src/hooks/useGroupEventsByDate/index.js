import { useMemo } from 'react';

import moment from 'moment';
import { DATE_FULL_NUMERAL } from 'constants/formats/dates';

import map from '@misakey/helpers/map';
import entries from '@misakey/helpers/entries';
import pipe from '@misakey/helpers/pipe';
import groupBy from '@misakey/helpers/groupBy';
import sortBy from '@misakey/helpers/sortBy';

// HELPERS
const groupByDay = (events) => groupBy(events, ({ serverEventCreatedAt }) => moment(serverEventCreatedAt).startOf('day').format());
const mapEventsGrouped = (days) => map(days, ([day, events]) => ({
  day,
  events: sortBy(events, 'serverEventCreatedAt'),
  date: moment(day).format(DATE_FULL_NUMERAL),
}));
const sortByDay = (events) => sortBy(events, 'day');

const groupMapSort = pipe(groupByDay, entries, mapEventsGrouped, sortByDay);

// HOOKS
export default (events) => {
  const displayedEventsGroupedByDate = useMemo(
    () => groupMapSort(events),
    [events],
  );

  return displayedEventsGroupedByDate;
};
