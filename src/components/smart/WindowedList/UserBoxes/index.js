import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import routes from 'routes';
import STATUSES, { OPEN } from 'constants/app/boxes/statuses';

import isNil from '@misakey/helpers/isNil';

import usePaginateBoxesByStatus from 'hooks/usePaginateBoxesByStatus';

import Empty from 'components/dumb/Box/Empty';
import WindowedListInfiniteLoaded from 'components/smart/WindowedList/InfiniteLoaded';
import WindowedListAutosized from 'components/smart/WindowedList/Autosized';
import Row, { Skeleton } from 'components/smart/WindowedList/UserBoxes/Row';

import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';

// COMPONENTS
function WindowedListBoxes({ activeStatus, ...props }) {
  const locationSearchParams = useLocationSearchParams();

  const { search } = locationSearchParams;

  const {
    byPagination,
    itemCount,
    loadMoreItems,
  } = usePaginateBoxesByStatus(activeStatus, search);

  const itemData = useMemo(
    () => ({
      toRoute: routes.boxes.read._,
      byPagination,
    }),
    [byPagination],
  );

  if (isNil(itemCount) || itemCount === 0) {
    return <Empty px={1} />;
  }

  return (
    <WindowedListInfiniteLoaded
      key={itemCount}
      Row={Row}
      Skeleton={Skeleton}
      list={WindowedListAutosized}
      loadMoreItems={loadMoreItems}
      itemCount={itemCount}
      itemSize={72}
      itemData={itemData}
      {...props}
    />
  );
}

WindowedListBoxes.propTypes = {
  activeStatus: PropTypes.oneOf(STATUSES),
  // CONNECT
  isAuthenticated: PropTypes.bool.isRequired,
};

WindowedListBoxes.defaultProps = {
  activeStatus: OPEN,
};

export default WindowedListBoxes;
