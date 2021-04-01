import React, { useMemo, useCallback, forwardRef } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import InfiniteLoader from 'react-window-infinite-loader';
import { FixedSizeGrid as Grid } from 'react-window';
import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

// COMPONENTS
const DefaultSkeleton = withTranslation('common')(({ t, style, ...props }) => (
  <ListItem style={style} {...omitTranslationProps(props)}>
    <ListItemText primary={t('common:loading')} />
  </ListItem>
));

const WindowedGridInfiniteLoaded = forwardRef(({
  threshold,
  minimumBatchSize,
  loadMoreItems,
  loadedIndexes,
  Cell,
  Skeleton,
  itemCount,
  numColumns,
  rowHeight,
  height,
  width,
  ...props
}, forwardedRef) => {
  const rowCount = useMemo(() => Math.ceil(itemCount / numColumns), [itemCount, numColumns]);

  // will ask for n elements:
  // threshold + minimumBatchSize at start
  // minimumBatchSize then
  // will be triggered whenever we reach end of fetched elements - threshold
  const onLoadMoreItems = useCallback(
    (startIndex, stopIndex) => loadMoreItems(
      { offset: startIndex, limit: stopIndex + 1 - startIndex },
    ),
    [loadMoreItems],
  );

  const isItemLoaded = useCallback(
    (index) => loadedIndexes.includes(index.toString()),
    [loadedIndexes],
  );

  const columnWidth = useMemo(() => width / numColumns, [numColumns, width]);

  const CellOrSkeleton = useCallback(
    (args) => {
      const { columnIndex, rowIndex } = args;
      const itemIndex = rowIndex * numColumns + columnIndex;
      if (itemIndex >= itemCount) { return null; }
      return isItemLoaded(itemIndex)
        ? <Cell itemIndex={itemIndex} {...args} />
        : <Skeleton index={itemIndex} {...args} />;
    },
    [isItemLoaded, itemCount, numColumns],
  );

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={onLoadMoreItems}
      minimumBatchSize={minimumBatchSize}
      threshold={threshold}
    >
      {({ onItemsRendered, ref }) => (
        <Grid
          columnCount={numColumns}
          columnWidth={columnWidth}
          height={height}
          rowCount={rowCount}
          rowHeight={rowHeight}
          onItemsRendered={(gridProps) => {
            onItemsRendered({
              overscanStartIndex: gridProps.overscanRowStartIndex * numColumns,
              overscanStopIndex: gridProps.overscanRowStopIndex * numColumns,
              visibleStartIndex: gridProps.visibleRowStartIndex * numColumns,
              visibleStopIndex: gridProps.visibleRowStopIndex * numColumns,
            });
          }}
          ref={ref}
          outerRef={forwardedRef}
          width={width}
          {...props}
        >
          {CellOrSkeleton}
        </Grid>
      )}
    </InfiniteLoader>
  );
});

WindowedGridInfiniteLoaded.propTypes = {
  Cell: PropTypes.elementType.isRequired,
  Skeleton: PropTypes.elementType,
  // params: {offset, limit}
  loadMoreItems: PropTypes.func.isRequired,
  loadedIndexes: PropTypes.arrayOf(PropTypes.string),
  itemCount: PropTypes.number.isRequired,
  numColumns: PropTypes.number,
  rowHeight: PropTypes.number,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  threshold: PropTypes.number,
  // minimum number of elements to ask at once
  // low number reduces number of elements fetched at start
  // high number reduces frequency of reloading
  // best is optimal perf related to API
  minimumBatchSize: PropTypes.number,
};

WindowedGridInfiniteLoaded.defaultProps = {
  Skeleton: DefaultSkeleton,
  loadedIndexes: [],
  numColumns: 2,
  rowHeight: 72,
  threshold: 2,
  minimumBatchSize: 5,
};

export default WindowedGridInfiniteLoaded;
