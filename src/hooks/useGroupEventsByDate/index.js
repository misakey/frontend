import { useMemo } from 'react';

import moment from 'moment';
import { DATE_FULL_NUMERAL } from '@misakey/ui/constants/formats/dates';

import map from '@misakey/core/helpers/map';
import entries from '@misakey/core/helpers/entries';
import pipe from '@misakey/core/helpers/pipe';
import groupBy from '@misakey/core/helpers/groupBy';
import sortBy from '@misakey/core/helpers/sortBy';

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
