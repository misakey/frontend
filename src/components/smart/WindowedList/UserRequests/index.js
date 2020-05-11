import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import routes from 'routes';
import REQUEST_STATUSES, { DONE } from 'constants/databox/status';

import isNil from '@misakey/helpers/isNil';

import usePaginateRequestsByStatus from 'hooks/usePaginateRequestsByStatus';

import Empty from 'components/dumb/Box/Empty';
import WindowedListInfiniteLoaded from 'components/smart/WindowedList/InfiniteLoaded';
import WindowedListAutosized from 'components/smart/WindowedList/Autosized';
import Row, { Skeleton } from 'components/smart/WindowedList/UserRequests/Row';

// COMPONENTS
function WindowedListUserRequests({
  activeStatus,
  isAuthenticated,
  ...props
}) {
  const {
    byPagination,
    itemCount,
    loadMoreItems,
  } = usePaginateRequestsByStatus(activeStatus);

  const itemData = useMemo(
    () => ({
      toRoute: routes.citizen.requests.read,
      byPagination,
    }),
    [byPagination],
  );

  if (!isAuthenticated) {
    return null;
  }

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

WindowedListUserRequests.propTypes = {
  activeStatus: PropTypes.oneOf(REQUEST_STATUSES),
  // CONNECT
  isAuthenticated: PropTypes.bool.isRequired,
};

WindowedListUserRequests.defaultProps = {
  activeStatus: DONE,
};

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps, {})(WindowedListUserRequests);
