import React, {
  forwardRef,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useImperativeHandle,
  Fragment,
} from 'react';

import PropTypes from 'prop-types';

import BoxesSchema from 'store/schemas/Boxes';
import EventSchema from 'store/schemas/Boxes/Events';

import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';
import isFunction from '@misakey/core/helpers/isFunction';
import max from '@misakey/core/helpers/max';
import prop from '@misakey/core/helpers/prop';
import nth from '@misakey/core/helpers/nth';
import { denormalize } from 'normalizr';
import getScrollDiff from '@misakey/core/helpers/getScrollDiff';

import useCombinedRefs from '@misakey/hooks/useCombinedRefs';
import usePrevPropEffect from '@misakey/hooks/usePrevPropEffect';
import useGroupEventsByDate from 'hooks/useGroupEventsByDate';
import usePaginateEventsByBox from 'hooks/usePaginateEventsByBox';
import useNotDoneEffect from '@misakey/hooks/useNotDoneEffect';
import useMountEffect from '@misakey/hooks/useMountEffect';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useOnScroll from '@misakey/hooks/useOnScroll';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import BoxEventsAccordingToType from 'components/smart/Box/Event';
import TypographySeparator from '@misakey/ui/Typography/Separator';
import Grow from '@material-ui/core/Grow';

import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import ScrollAnchor from '@misakey/ui/ScrollAnchor';

// CONSTANTS
const THRESHOLD = 200; // px
const MAXIMUM_BATCH_SIZE = 10;

// HELPERS
const idProp = prop('id');

// HOOKS
const useStyles = makeStyles(() => ({
  root: {
    overflow: 'auto',
    '& > *': {
      overflowAnchor: 'none',
    },
  },
  loader: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
  },
}));

// COMPONENTS
const PaginatedListBoxEvents = forwardRef(({ box, onScroll }, ref) => {
  const classes = useStyles();
  const combinedRef = useCombinedRefs(ref);
  const paginationOffsetRef = useRef(0);

  const { eventsCount } = useSafeDestr(box);

  const {
    itemCount, byPagination, isFetching, loadMoreItems,
  } = usePaginateEventsByBox();

  const { t } = useTranslation('common');

  const eventIds = useMemo(
    () => Object.values(byPagination),
    [byPagination],
  );

  const events = useSelector(
    (state) => (isEmpty(eventIds)
      ? []
      : denormalize(Object.values(byPagination), EventSchema.collection, state.entities)),
  );

  const notNilEvents = useMemo(
    () => events.filter((event) => !isNil(event)),
    [events],
  );

  const firstNewEventId = useMemo(
    () => {
      if (!isNil(eventsCount) && eventsCount > 0) {
        // NB: notNilEvents is sorted from most recent to least recent
        const firstNewEvent = nth(notNilEvents, eventsCount - 1);
        return idProp(firstNewEvent);
      }
      return null;
    },
    [eventsCount, notNilEvents],
  );

  const eventsByDate = useGroupEventsByDate(notNilEvents);

  const onLoadMoreItems = useCallback(
    () => {
      const offset = paginationOffsetRef.current;
      const limit = Math.min(itemCount - offset, MAXIMUM_BATCH_SIZE);
      if (limit <= 0) {
        return Promise.resolve();
      }
      paginationOffsetRef.current += limit;
      return loadMoreItems(
        { offset, limit },
      );
    },
    [loadMoreItems, itemCount, paginationOffsetRef],
  );

  const onLoadMoreItemsRef = useRef(onLoadMoreItems);

  const restoreScrollPosition = useCallback(
    () => {
      const { current } = combinedRef;
      const prev = current.scrollHeight;
      return () => {
        const next = current.scrollHeight;
        const expansion = next - prev;
        current.scrollTop += expansion;
      };
    },
    [combinedRef],
  );

  const handleScroll = useCallback(
    (e) => {
      if (isFunction(onScroll)) {
        onScroll(e);
      }
    },
    [onScroll],
  );

  const handleScrollTop = useCallback(
    (e) => {
      const { target } = e;
      const scrollDiff = getScrollDiff(target);
      if (target.scrollTop < THRESHOLD && scrollDiff > 0) {
        if (!isFetching) {
          const restorer = restoreScrollPosition();
          onLoadMoreItemsRef.current()
            .then(restorer);
        }
        if (paginationOffsetRef.current < itemCount) {
          target.scrollTop = THRESHOLD;
        }
      }
    },
    [
      onLoadMoreItemsRef, restoreScrollPosition,
      isFetching, paginationOffsetRef, itemCount,
    ],
  );

  const scrollToBottom = useCallback(
    () => {
      const { current } = combinedRef;
      if (!isNil(current)) {
        current.scrollTop = getScrollDiff(current);
      }
    },
    [combinedRef],
  );

  // [HANDLE SCROLL]
  usePrevPropEffect(notNilEvents, (prevEvents, nextEvents) => {
    if (isEmpty(prevEvents) && !isEmpty(nextEvents)) {
      requestAnimationFrame(
        () => scrollToBottom(),
      );
    }
  },
  [scrollToBottom]);

  const resetScrollInit = useNotDoneEffect(
    (onDone) => {
      const { current } = combinedRef;
      if (!isEmpty(notNilEvents) && !isNil(current)) {
        const scrollDiff = getScrollDiff(current);
        if ((scrollDiff) > THRESHOLD || notNilEvents.length === itemCount) {
          scrollToBottom();
          onDone();
        } else {
          // effect must be triggered again
          scrollToBottom();
        }
      }
    },
    [notNilEvents, scrollToBottom, combinedRef],
  );

  // [/HANDLE SCROLL]

  // UPDATE OFFSET
  useEffect(
    () => {
      const maxOffset = max(Object.keys(byPagination).map((key) => parseInt(key, 10)));
      const offset = isNil(maxOffset) ? 0 : maxOffset + 1;
      paginationOffsetRef.current = Math.max(paginationOffsetRef.current, offset);
    },
    [paginationOffsetRef, byPagination],
  );

  // UPDATE REF
  useEffect(
    () => {
      onLoadMoreItemsRef.current = onLoadMoreItems;
    },
    [onLoadMoreItemsRef, onLoadMoreItems],
  );

  // [LOAD MORE ITEMS]
  const shouldFetch = useMemo(
    () => {
      const { length } = notNilEvents;
      const { current } = paginationOffsetRef;
      return !isNil(itemCount) && length > 0 && length < itemCount && length === current;
    },
    [notNilEvents, itemCount, paginationOffsetRef],
  );

  // INIT
  useMountEffect(
    () => {
      if (!isNil(itemCount) && paginationOffsetRef.current === 0) {
        onLoadMoreItemsRef.current();
      }
    },
    [itemCount, onLoadMoreItemsRef, paginationOffsetRef],
  );

  // FETCH MORE WHEN LIST IS NOT FULL
  useNotDoneEffect(
    (onDone) => {
      if (shouldFetch) {
        const { current } = combinedRef;
        const scrollDiff = getScrollDiff(current);
        if (scrollDiff === 0) {
          onLoadMoreItemsRef.current();
        } else {
          onDone();
        }
      }
    },
    [shouldFetch, onLoadMoreItemsRef, combinedRef],
  );

  // RESET
  usePrevPropEffect(itemCount, (prevItemCount, nextItemCount) => {
    if (isNil(prevItemCount) && !isNil(nextItemCount)) {
      // reset pagination offset ref
      paginationOffsetRef.current = 0;
      onLoadMoreItemsRef.current();
      resetScrollInit();
    }
  }, [onLoadMoreItemsRef, paginationOffsetRef]);
  // [/LOAD MORE ITEMS]

  // IMPERATIVE HANDLE FOR EXTERNAL CALLS
  useImperativeHandle(ref, () => ({
    scrollToBottom,
  }), [scrollToBottom]);

  useOnScroll(combinedRef, handleScrollTop, 0);
  useOnScroll(combinedRef, handleScroll);

  return (
    <>
      {isFetching && !isEmpty(byPagination) && (
        <HourglassEmptyIcon color="primary" fontSize="small" className={classes.loader} />
      )}
      <Box ref={combinedRef} flexGrow="1" className={classes.root}>
        {eventsByDate.map(({ date, events: groupedEvents }) => (
          <Box display="flex" flexDirection="column" mt={1} key={date}>
            <Typography align="center" color="textPrimary" variant="caption">
              {date}
            </Typography>
            {
              groupedEvents.map((event) => (
                <Fragment key={event.id}>
                  <Grow in={firstNewEventId === event.id} mountOnEnter>
                    <TypographySeparator color="primary" variant="caption">{t('common:newMessages')}</TypographySeparator>
                  </Grow>
                  <BoxEventsAccordingToType
                    box={box}
                    event={event}
                    key={event.id}
                  />
                </Fragment>
              ))
            }
          </Box>
        ))}
        <ScrollAnchor height="1px" />
      </Box>
    </>
  );
});

PaginatedListBoxEvents.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  onScroll: PropTypes.func,
};

PaginatedListBoxEvents.defaultProps = {
  onScroll: null,
};

export default PaginatedListBoxEvents;
