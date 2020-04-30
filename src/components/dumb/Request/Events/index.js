import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import moment from 'moment';

import { DATE_FULL_NUMERAL } from 'constants/formats/dates';
import { SENDING, ANSWERING, ACCEPTING, REOPENING, TERMINATING, UPLOADING, CONFIRM_EMAIL, MISAKEY } from 'constants/databox/event';

import Box from '@material-ui/core/Box';
import RequestSimpleEventCard from 'components/dumb/Card/Event/Request/Simple';
import RequestFileEventCard from 'components/dumb/Card/Event/Request/File';
import Typography from '@material-ui/core/Typography';

import map from '@misakey/helpers/map';
import entries from '@misakey/helpers/entries';
import pipe from '@misakey/helpers/pipe';
import isNil from '@misakey/helpers/isNil';
import groupBy from '@misakey/helpers/groupBy';
import sortBy from '@misakey/helpers/sortBy';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import useLocationWorkspace from '@misakey/hooks/useLocationWorkspace';
import SplashScreen from '@misakey/ui/Screen/Splash';

import DataboxSchema from 'store/schemas/Databox';

// CONSTANTS
const DISPLAYED_EVENTS = [
  SENDING,
  REOPENING,
  TERMINATING,
  ACCEPTING,
  ANSWERING,
  UPLOADING,
];

// HELPERS
// Event to be displayed next to sending event (not from backend)
const buildMisagentEventFromSending = ({ databoxId, createdAt }, t) => ({
  id: new Date().getUTCMilliseconds(),
  databoxId,
  authorRole: MISAKEY,
  action: CONFIRM_EMAIL,
  metadata: null,
  createdAt,
  author: {
    displayName: t('common:requests.events.author.misakey'),
    avatarUri: '/ico/favicon-48x48.png',
  },
});

const groupByDay = (events) => groupBy(events, ({ createdAt }) => moment(createdAt).startOf('day').format());
const mapEventsGrouped = (days) => map(days, ([day, events]) => ({
  day,
  events: sortBy(events, 'createdAt'),
  date: moment(day).format(DATE_FULL_NUMERAL),
}));
const sortByDay = (events) => sortBy(events, 'day');

// COMPONENTS
const RequestEvents = ({ request, isFetching, t, ...rest }) => {
  const workspace = useLocationWorkspace();

  const { logs = [] } = useMemo(() => request || {}, [request]);
  const sendingEvent = useMemo(() => logs.find(({ action } = {}) => action === SENDING), [logs]);
  const misagentEvent = useMemo(
    () => (sendingEvent ? buildMisagentEventFromSending(sendingEvent, t) : null),
    [sendingEvent, t],
  );

  const displayedEvents = useMemo(
    () => {
      const logsFromApi = logs.filter(({ action }) => DISPLAYED_EVENTS.includes(action));
      if (!isNil(misagentEvent)) {
        return [...logsFromApi, buildMisagentEventFromSending(sendingEvent, t)];
      }
      return logsFromApi;
    },
    [logs, misagentEvent, sendingEvent, t],
  );

  const displayedEventsGroupedByDate = useMemo(
    () => pipe(groupByDay, entries, mapEventsGrouped, sortByDay)(displayedEvents),
    [displayedEvents],
  );

  if (isFetching) {
    return <SplashScreen />;
  }

  return (
    <Box {...omitTranslationProps(rest)}>
      {displayedEventsGroupedByDate.map(({ date, events }) => (
        <Box display="flex" flexDirection="column" py={1} key={date}>
          <Typography component={Box} alignSelf="center">{date}</Typography>
          {
            events.map((event) => (
              event.action === UPLOADING ? (
                <RequestFileEventCard
                  key={event.id}
                  event={event}
                  request={request}
                  fromWorkspace={workspace}
                />
              ) : (
                <RequestSimpleEventCard
                  key={event.id}
                  event={event}
                  request={request}
                  fromWorkspace={workspace}
                />
              )
            ))
          }
        </Box>
      ))}
    </Box>
  );
};

RequestEvents.propTypes = {
  request: PropTypes.shape(DataboxSchema.propTypes),
  isFetching: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

RequestEvents.defaultProps = {
  request: null,
  isFetching: false,
};


export default withTranslation('common')(RequestEvents);
