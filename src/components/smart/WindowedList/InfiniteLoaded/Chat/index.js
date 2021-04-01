import React, { useMemo, forwardRef, useRef, useCallback, useImperativeHandle, useState } from 'react';
import PropTypes from 'prop-types';

import isNil from '@misakey/core/helpers/isNil';

import { useTranslation } from 'react-i18next';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useFetchCallback from '@misakey/hooks/useFetch/callback';

import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import MuiSkeleton from '@material-ui/lab/Skeleton';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import Box from '@material-ui/core/Box';
import { VariableSizeList as List } from 'react-window';

// CONSTANTS
// gutter to display loaders, see `innerElementType`
const GUTTER_TOP = 31;
const HEIGHT_FALLBACK = 100;

/*
Inspired from https://codesandbox.io/s/react-window-dynamic-list-xlfkq?file=/src/components/List.tsx:541-554
for dynamic sizing of the element
It could be improved with the next version of react-window
(dynamic-size: https://react-window-next.now.sh/#/examples/list/dynamic-size)

See https://www.npmjs.com/package/react-window-infinite-loader#creating-an-infinite-loading-list
for infinite loading logic

See src/components/screens/app/Notifications/Row.js to see how to use the `setSize` logic
*/

const InfiniteLoaderChat = forwardRef(({
  hasNextPage,
  isNextPageLoading,
  loadNextPage, // should returns a Promise with the number of new items added
  Skeleton,
  Row,
  height,
  width,
  itemCount,
  itemData,
  // optional: displayed when top of the list is reached
  NoMoreItemsElement,
  initialScrollOffset,
  ...props
}, forwardedRef) => {
  const { t } = useTranslation('common');
  const [isReady, setIsReady] = useState();

  const sizeMap = useRef({});
  const listRef = useRef();
  const outerRef = useRef();

  // Only load 1 page of items at a time.
  // Pass an empty callback to InfiniteLoader in case it asks us to load more than once.
  const loadMoreItems = useMemo(
    () => (isNextPageLoading ? () => Promise.resolve() : loadNextPage),
    [isNextPageLoading, loadNextPage],
  );

  // Every row is loaded except for our loading indicator row.
  const isItemLoaded = useCallback(
    (index) => !hasNextPage || index < itemCount,
    [hasNextPage, itemCount],
  );

  const setSize = useCallback(
    (index, size) => {
      // Performance: Only update the sizeMap and reset cache if an actual value changed
      if (sizeMap.current[index] !== size) {
        sizeMap.current = { ...sizeMap.current, [index]: size };
        if (listRef.current && listRef.current.resetAfterIndex) {
          // Clear cached data and rerender
          listRef.current.resetAfterIndex(0);
        }
      }
    },
    [],
  );

  const itemDataWithSetSize = useMemo(
    () => ({ ...itemData, setSize }),
    [itemData, setSize],
  );

  // Render an item or a loading indicator.
  const Item = useCallback(
    ({ index, style, ...rest }) => {
      const customStyle = {
        ...style,
        top: parseFloat(style.top) + GUTTER_TOP,
      };
      if (!isItemLoaded(index)) {
        return <Skeleton style={customStyle} index={index} />;
      }
      return <Row style={customStyle} index={index} {...rest} />;
    },
    [isItemLoaded],
  );

  const getSize = useCallback(
    (index) => (!isNil(sizeMap.current[index]) ? sizeMap.current[index] : HEIGHT_FALLBACK),
    [],
  );

  const calcEstimatedSize = useCallback(
    () => {
      const keys = Object.keys(sizeMap.current);
      const estimatedHeight = keys.reduce((p, i) => p + sizeMap.current[i], 0);
      return estimatedHeight / keys.length;
    },
    [],
  );

  const innerElementType = useMemo(
    () => forwardRef((args, ref) => (
      <div ref={ref}>
        <Box display="flex" justifyContent="center">
          {isNextPageLoading && <HourglassEmptyIcon color="primary" />}
          {/* Fallback in case scroll hasn't been triggered well */}
          {!isNextPageLoading && hasNextPage && (
            <Button
              standing={BUTTON_STANDINGS.TEXT}
              onClick={loadMoreItems}
              text={t('components:InfiniteLoadedChat.loadMore')}
              size="small"
            />
          )}
          {!isNil(NoMoreItemsElement) && !hasNextPage && !isNextPageLoading && NoMoreItemsElement}
        </Box>
        <div {...args} />
        <Box
          ref={(anchorRef) => {
            if (anchorRef && !isReady) {
              // @FIXME does not fully scroll to bottom
              anchorRef.scrollIntoView(false);
            }
          }}
          height="1px"
        />
      </div>
    )),
    [NoMoreItemsElement, hasNextPage, isNextPageLoading, isReady, loadMoreItems, t],
  );

  const onMoreItemsLoaded = useCallback(
    (numberOfNewItems) => {
      // scroll to previous first item for user not to be lost in nav
      listRef.current.scrollToItem(numberOfNewItems, 'start');
    },
    [],
  );

  const { wrappedFetch: onLoadMoreItems } = useFetchCallback(
    loadMoreItems,
    { onSuccess: onMoreItemsLoaded },
  );

  const onScroll = useCallback(
    ({ scrollOffset, scrollUpdateWasRequested }) => {
      if (!scrollUpdateWasRequested && scrollOffset !== initialScrollOffset) {
        setIsReady(true);
      }
      if (scrollOffset === 0 && hasNextPage && !isNextPageLoading && isReady) {
        onLoadMoreItems();
      }
    },
    [hasNextPage, initialScrollOffset, isNextPageLoading, isReady, onLoadMoreItems],
  );

  useImperativeHandle(forwardedRef, () => ({
    get outerRef() {
      return outerRef.current;
    },
    get listRef() {
      return listRef.current;
    },
  }));

  useFetchEffect(
    loadMoreItems,
    { shouldFetch: isNil(itemCount) },
  );

  return (
    <List
      height={height}
      width={width}
      itemCount={itemCount}
      itemData={itemDataWithSetSize}
      onScroll={onScroll}
      initialScrollOffset={initialScrollOffset}
      outerRef={outerRef}
      ref={listRef}
      estimatedItemSize={calcEstimatedSize()}
      itemSize={getSize}
      innerElementType={innerElementType}
      {...props}
    >
      {Item}
    </List>
  );
});

InfiniteLoaderChat.propTypes = {
  Row: PropTypes.elementType.isRequired,
  Skeleton: PropTypes.elementType,
  itemCount: PropTypes.number,
  itemData: PropTypes.object,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  isNextPageLoading: PropTypes.bool.isRequired,
  hasNextPage: PropTypes.bool.isRequired,
  loadNextPage: PropTypes.func.isRequired,
  NoMoreItemsElement: PropTypes.node,
  initialScrollOffset: PropTypes.number,
};

InfiniteLoaderChat.defaultProps = {
  Skeleton: MuiSkeleton,
  itemCount: 0,
  itemData: {},
  initialScrollOffset: 0,
  NoMoreItemsElement: null,
};

export default InfiniteLoaderChat;
