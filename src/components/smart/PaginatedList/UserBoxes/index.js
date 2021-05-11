import React, {
  forwardRef,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import PropTypes from 'prop-types';

import BoxesSchema from 'store/schemas/Boxes';
import { TO_PROP_TYPE } from '@misakey/ui/constants/propTypes';
import { BOXES_FILTER_ID } from 'constants/pagination/filterId';

import isNil from '@misakey/core/helpers/isNil';
import complement from '@misakey/core/helpers/complement';
import isEmpty from '@misakey/core/helpers/isEmpty';
import equals from '@misakey/core/helpers/equals';
import isFunction from '@misakey/core/helpers/isFunction';
import max from '@misakey/core/helpers/max';
import { denormalize } from 'normalizr';
import getScrollDiff from '@misakey/core/helpers/getScrollDiff';

import useCombinedRefs from '@misakey/hooks/useCombinedRefs';
import usePaginateBoxesByStatus from 'hooks/usePaginateBoxesByStatus';
import useOnScroll from '@misakey/hooks/useOnScroll';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useSelector } from 'react-redux';
import useMountEffect from '@misakey/hooks/useMountEffect';
import usePrevPropEffect from '@misakey/hooks/usePrevPropEffect';

import Box from '@material-ui/core/Box';
import BoxListItem, { BoxListItemSkeleton } from 'components/smart/ListItem/Boxes';

// CONSTANTS
const THRESHOLD = 200; // px
const MAXIMUM_BATCH_SIZE = 10;

// HELPERS
const isNotNil = complement(isNil);

// HOOKS
const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    overflow: 'auto',
  },
  loader: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
  },
}));

// COMPONENTS
const PaginatedListUserBoxes = forwardRef(({
  component: Component,
  search,
  onScroll,
  toRoute,
  onClick,
  nextSearchMap,
  children,
  ...props
},
ref) => {
  const classes = useStyles();
  const combinedRef = useCombinedRefs(ref);
  const paginationOffsetRef = useRef(0);

  const {
    byPagination,
    itemCount,
    isFetching,
    loadMoreItems,
  } = usePaginateBoxesByStatus(BOXES_FILTER_ID, {}, search);

  const boxIds = useMemo(
    () => Object.values(byPagination).filter(isNotNil),
    [byPagination],
  );

  const boxes = useSelector(
    (state) => (isEmpty(boxIds)
      ? []
      : denormalize(boxIds, BoxesSchema.collection, state.entities)),
  );

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

  const handleScroll = useCallback(
    (e) => {
      if (isFunction(onScroll)) {
        onScroll(e);
      }
    },
    [onScroll],
  );

  const handleScrollBottom = useCallback(
    (e) => {
      const { target } = e;
      const scrollDiff = getScrollDiff(target);
      const bottomThreshold = scrollDiff - THRESHOLD;
      if (target.scrollTop > bottomThreshold && scrollDiff > 0) {
        if (!isFetching) {
          onLoadMoreItemsRef.current();
        }
        if (paginationOffsetRef.current < itemCount) {
          target.scrollTop = bottomThreshold;
        }
      }
    },
    [isFetching, itemCount],
  );

  // UPDATE OFFSET
  useEffect(
    () => {
      if (isEmpty(byPagination)) {
        paginationOffsetRef.current = 0;
      } else {
        const maxOffset = max(Object.keys(byPagination).map((key) => parseInt(key, 10)));
        const offset = isNil(maxOffset) ? 0 : maxOffset + 1;
        paginationOffsetRef.current = Math.max(paginationOffsetRef.current, offset);
      }
    },
    [paginationOffsetRef, byPagination, search],
  );

  // UPDATE REF
  useEffect(
    () => {
      onLoadMoreItemsRef.current = onLoadMoreItems;
    },
    [onLoadMoreItemsRef, onLoadMoreItems],
  );

  // [LOAD MORE ITEMS]
  // FETCH WHEN LIST IS EMPTY
  useMountEffect(
    () => {
      if (!isNil(itemCount) && paginationOffsetRef.current === 0) {
        onLoadMoreItemsRef.current();
      }
    },
    [itemCount, onLoadMoreItemsRef, paginationOffsetRef],
  );

  // FETCH AND RESET PAGINATION WHEN SEARCH CHANGES
  usePrevPropEffect(search, (prevSearch, nextSearch) => {
    if (!equals(prevSearch, nextSearch) && (!isEmpty(prevSearch) || !isEmpty(nextSearch))) {
      paginationOffsetRef.current = 0;
      onLoadMoreItemsRef.current();
    }
  },
  [onLoadMoreItemsRef, paginationOffsetRef]);

  // FETCH MORE WHEN LIST IS NOT FULL
  const shouldFetchMore = useMemo(
    () => {
      const { length } = boxIds;
      const { current } = paginationOffsetRef;
      return !isNil(itemCount) && !isFetching
        && length > 0 && length < itemCount && length === current;
    },
    [boxIds, itemCount, paginationOffsetRef, isFetching],
  );

  useEffect(
    () => {
      if (shouldFetchMore) {
        const { current } = combinedRef;
        const scrollDiff = getScrollDiff(current);
        if (scrollDiff === 0) {
          onLoadMoreItemsRef.current();
        }
      }
    },
    [onLoadMoreItemsRef, combinedRef, shouldFetchMore],
  );
  // [/LOAD MORE ITEMS]

  useOnScroll(combinedRef, handleScrollBottom, 0);
  useOnScroll(combinedRef, handleScroll);

  return (
    <Component
      ref={combinedRef}
      className={classes.root}
      {...props}
    >
      {children}
      {boxes.map((box, index) => (isNil(box) ? (
        <BoxListItemSkeleton key={boxIds[index]} />
      ) : (
        <BoxListItem
          onClick={onClick}
          toRoute={toRoute}
          nextSearchMap={nextSearchMap}
          box={box}
          id={box.id}
          key={box.id}
        />
      )))}
    </Component>
  );
});

PaginatedListUserBoxes.propTypes = {
  component: PropTypes.elementType,
  children: PropTypes.node,
  search: PropTypes.object,
  onScroll: PropTypes.func,
  toRoute: TO_PROP_TYPE,
  onClick: PropTypes.func,
  nextSearchMap: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)),
};

PaginatedListUserBoxes.defaultProps = {
  component: Box,
  children: null,
  search: null,
  onScroll: null,
  onClick: undefined,
  toRoute: null,
  nextSearchMap: [],
};

export default PaginatedListUserBoxes;
