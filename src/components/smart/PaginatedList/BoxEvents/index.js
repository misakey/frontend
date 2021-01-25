import React, {
  forwardRef,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
} from 'react';

import PropTypes from 'prop-types';

import BoxesSchema from 'store/schemas/Boxes';
import EventSchema from 'store/schemas/Boxes/Events';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import max from '@misakey/helpers/max';
import { denormalize } from 'normalizr';

import useCombinedRefs from '@misakey/hooks/useCombinedRefs';
import usePrevPropEffect from '@misakey/hooks/usePrevPropEffect';
import useGroupEventsByDate from 'hooks/useGroupEventsByDate';
import usePaginateEventsByBox from 'hooks/usePaginateEventsByBox';
import useNotDoneEffect from 'hooks/useNotDoneEffect';
import useMountEffect from '@misakey/hooks/useMountEffect';
import useIntersectionObserver from '@misakey/hooks/useIntersectionObserver';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useSelector } from 'react-redux';

import Box from '@material-ui/core/Box';
import TypographySeparator from '@misakey/ui/Typography/Separator';
import BoxEventsAccordingToType from 'components/smart/Box/Event';

import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';


// CONSTANTS
const THRESHOLD = 200; // px
const MAXIMUM_BATCH_SIZE = 10;

// HELPERS
const getScrollDiff = ({ scrollHeight, clientHeight }) => scrollHeight - clientHeight;

// HOOKS
const useStyles = makeStyles(() => ({
  root: {
    overflow: 'auto',
    '& > *': {
      overflowAnchor: 'none',
    },
  },
  anchor: ({ anchorBottom }) => ({
    overflowAnchor: anchorBottom ? 'auto' : 'none',
  }),
  loader: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
  },
}));

// COMPONENTS
const PaginatedListBoxEvents = forwardRef(({ box }, ref) => {
  const combinedRef = useCombinedRefs(ref);
  const paginationOffsetRef = useRef(0);
  const anchorRef = useRef();

  const [anchorBottom, setAnchorBottom] = useState(false);

  const {
    itemCount, byPagination, isFetching, loadMoreItems,
  } = usePaginateEventsByBox();

  const classes = useStyles({ anchorBottom });

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

  const onScroll = useCallback(
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

  const onAnchorIntersects = useCallback(
    (entry) => {
      if (entry.isIntersecting === true) {
        setAnchorBottom(true);
      } else {
        setAnchorBottom(false);
      }
    },
    [setAnchorBottom],
  );

  // watch anchor visibility, if visible, set overflowAnchor, else not
  useIntersectionObserver(anchorRef, onAnchorIntersects, true);
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

  return (
    <>
      {isFetching && !isEmpty(byPagination) && (
      <HourglassEmptyIcon color="primary" fontSize="small" className={classes.loader} />
      )}
      <Box ref={combinedRef} flexGrow="1" className={classes.root} onScroll={onScroll}>
        {eventsByDate.map(({ date, events: groupedEvents }) => (
          <Box display="flex" flexDirection="column" mt={1} key={date}>
            <TypographySeparator>
              {date}
            </TypographySeparator>
            {
          groupedEvents.map((event) => (
            <BoxEventsAccordingToType
              box={box}
              event={event}
              key={event.id}
            />
          ))
        }
          </Box>
        ))}
        <Box ref={anchorRef} height="1px" className={classes.anchor} />
      </Box>
    </>
  );
});

PaginatedListBoxEvents.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
};

export default PaginatedListBoxEvents;
