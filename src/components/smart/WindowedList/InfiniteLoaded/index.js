import React, { useMemo, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import fill from '@misakey/helpers/fill';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import WindowedList from 'components/smart/WindowedList';
import InfiniteLoader from 'react-window-infinite-loader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

// COMPONENTS
const DefaultSkeleton = withTranslation('common')(({ t, style, ...props }) => (
  <ListItem style={style} {...omitTranslationProps(props)}>
    <ListItemText primary={t('common:loading')} />
  </ListItem>
));

const WindowedListInfiniteLoaded = forwardRef(({
  threshold,
  minimumBatchSize,
  list: List,
  loadMoreItems,
  Row,
  Skeleton,
  itemCount,
  ...props
}, loaderRef) => {
  const loadedItems = useMemo(
    () => fill(Array(itemCount), false),
    [itemCount],
  );

  // will ask for n elements:
  // threshold + minimumBatchSize at start
  // minimumBatchSize then
  // will be triggered whenever we reach end of fetched elements - threshold
  const onLoadMoreItems = useCallback(
    (startIndex, stopIndex) => loadMoreItems(
      { offset: startIndex, limit: stopIndex + 1 - startIndex },
    )
      .then(() => {
        fill(loadedItems, true, startIndex, stopIndex + 1);
      }),
    [loadMoreItems, loadedItems],
  );

  const isItemLoaded = useCallback(
    (index) => loadedItems[index],
    [loadedItems],
  );

  const RowOrSkeleton = useCallback(
    ({ index, ...rest }) => (isItemLoaded(index)
      ? <Row index={index} {...rest} />
      : <Skeleton index={index} {...rest} />),
    [isItemLoaded],
  );

  return (
    <InfiniteLoader
      ref={loaderRef}
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={onLoadMoreItems}
      minimumBatchSize={5}
      threshold={2}
    >
      {({ onItemsRendered, ref }) => (
        <List
          {...props}
          Row={RowOrSkeleton}
          itemCount={itemCount}
          onItemsRendered={onItemsRendered}
          ref={(list) => {
            ref(list);
          }}
        />
      )}
    </InfiniteLoader>
  );
});

WindowedListInfiniteLoaded.propTypes = {
  Row: PropTypes.elementType.isRequired,
  Skeleton: PropTypes.elementType,
  list: PropTypes.elementType,
  // params: {offset, limit}
  loadMoreItems: PropTypes.func.isRequired,
  itemCount: PropTypes.number.isRequired,
  // count of fetched elements before end to trigger next load
  // low number reduces number of elements fetched at start
  // high number reduces risk to see elements loading
  // best is balance between start and limited risk to see loading state
  threshold: PropTypes.number,
  // minimum number of elements to ask at once
  // low number reduces number of elements fetched at start
  // high number reduces frequency of reloading
  // best is optimal perf related to API
  minimumBatchSize: PropTypes.number,
};

WindowedListInfiniteLoaded.defaultProps = {
  Skeleton: DefaultSkeleton,
  list: WindowedList,
  threshold: 10,
  minimumBatchSize: 10,
};

export default WindowedListInfiniteLoaded;
