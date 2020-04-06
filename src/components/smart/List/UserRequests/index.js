import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { normalize, denormalize } from 'normalizr';
import { connect } from 'react-redux';

import routes from 'routes';
import API from '@misakey/api';
import REQUEST_STATUSES, { DONE } from 'constants/databox/status';
import DataboxSchema from 'store/schemas/Databox';
import ApplicationByIdSchema from 'store/schemas/Application/ById';
import { setAllRequestIdsForStatus } from 'store/actions/screens/allRequestIds';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import { receiveEntities, updateEntities } from '@misakey/store/actions/entities';

import propOr from '@misakey/helpers/propOr';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import isEmpty from '@misakey/helpers/isEmpty';
import pluck from '@misakey/helpers/pluck';
import isNil from '@misakey/helpers/isNil';

import useFetchEffect from '@misakey/hooks/useFetch/effect';

import Empty from 'components/dumb/Box/Empty';
import List from '@material-ui/core/List';
import RequestListItem, { RequestListItemSkeleton } from 'components/dumb/ListItem/Requests';

// CONSTANTS
const SKELETON_KEYS = [1, 2, 3];

// HELPERS
const getProducerIds = pluck('producerId');
const getRequestIds = pluck('id');

const fetchRequests = (payload) => API.use(API.endpoints.application.box.find)
  .build(null, null, objectToSnakeCase({
    withUsers: true,
    orderBy: 'updated_at DESC',
    ...payload,
  }))
  .send();

const fetchApplicationsInfos = (ids) => API
  .use({ ...API.endpoints.application.find, auth: true })
  .build(null, null, objectToSnakeCase({ ids }))
  .send();

const countBlobs = (id) => API.use(API.endpoints.application.box.blob.count)
  .build(null, null, objectToSnakeCase({
    databoxIds: [id],
  }))
  .send();

// COMPONENTS
const ListSkeleton = (props) => SKELETON_KEYS
  .map((key) => <RequestListItemSkeleton key={key} {...props} />);


function UserRequestsList({
  activeStatus,
  requests,
  dispatchReceiveRequests,
  dispatchUpdateEntities,
  dispatchReceiveApplications,
  isAuthenticated,
}) {
  const requestsList = useMemo(() => requests || [], [requests]);

  const shouldFetchRequests = useMemo(
    () => isAuthenticated && isNil(requests),
    [isAuthenticated, requests],
  );

  const missingApplicationsInfoIds = useMemo(
    () => getProducerIds(requestsList.filter(({ application }) => isNil(application))),
    [requestsList],
  );

  const missingBlobCountRequestIds = useMemo(
    () => getRequestIds(requestsList.filter(({ blobCount }) => isNil(blobCount))),
    [requestsList],
  );

  const shouldFetchApplication = useMemo(
    () => !isEmpty(missingApplicationsInfoIds),
    [missingApplicationsInfoIds],
  );

  const shouldFetchBlobCounts = useMemo(
    () => !isEmpty(missingBlobCountRequestIds),
    [missingBlobCountRequestIds],
  );

  const getRequests = useCallback(
    () => fetchRequests({ statuses: [activeStatus] }),
    [activeStatus],
  );

  const getApplicationsInfos = useCallback(
    () => fetchApplicationsInfos(missingApplicationsInfoIds),
    [missingApplicationsInfoIds],
  );

  // @FIXME: this treatment is going to by replaced by a backend feature `withBlobCount`
  // on `/databoxes` endpoints
  const getMissingBlobCounts = useCallback(
    () => Promise.all(
      missingBlobCountRequestIds.map((id) => countBlobs(id)
        .then((response) => {
          const blobCount = parseInt(response.headers.get('X-Total-Count'), 10) || 0;
          dispatchUpdateEntities(id, blobCount);
        })),
    ),
    [dispatchUpdateEntities, missingBlobCountRequestIds],
  );

  const onFetchRequestsSuccess = useCallback((response) => {
    dispatchReceiveRequests(response.map(objectToCamelCase));
  }, [dispatchReceiveRequests]);

  const onFetchApplicationsInfoSuccess = useCallback((response) => {
    dispatchReceiveApplications(response.map(objectToCamelCase));
  }, [dispatchReceiveApplications]);

  const { isFetching: isFetchingApplication } = useFetchEffect(
    getApplicationsInfos,
    { shouldFetch: shouldFetchApplication },
    { onSuccess: onFetchApplicationsInfoSuccess },
  );

  useFetchEffect(
    getMissingBlobCounts,
    { shouldFetch: shouldFetchBlobCounts },
  );

  const { isFetching: isFetchingRequests } = useFetchEffect(
    getRequests,
    { shouldFetch: shouldFetchRequests },
    { onSuccess: onFetchRequestsSuccess },
  );

  const isListEmpty = useMemo(
    () => isEmpty(requestsList) && !isFetchingRequests,
    [isFetchingRequests, requestsList],
  );

  const shouldDisplaySkeleton = useMemo(
    () => isEmpty(requestsList) && isFetchingRequests,
    [isFetchingRequests, requestsList],
  );

  return (
    <List disablePadding>
      {isListEmpty && <Empty px={1} />}
      {shouldDisplaySkeleton && <ListSkeleton />}
      {requestsList.map((request) => (
        <RequestListItem
          key={request.id}
          request={request}
          isFetchingApplication={isFetchingApplication}
          toRoute={routes.citizen.requests.read}
        />
      ))}
    </List>
  );
}

UserRequestsList.propTypes = {
  dispatchUpdateEntities: PropTypes.func.isRequired,
  dispatchReceiveRequests: PropTypes.func.isRequired,
  dispatchReceiveApplications: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  activeStatus: PropTypes.oneOf(REQUEST_STATUSES),
  requests: PropTypes.arrayOf(PropTypes.shape(DataboxSchema.propTypes)),
};

UserRequestsList.defaultProps = {
  requests: null,
  activeStatus: DONE,
};

const mapStateToProps = (state, ownProps) => {
  const { activeStatus } = ownProps;
  const requestsIds = propOr(null, activeStatus)(state.screens.allRequestIds);
  return {
    isAuthenticated: state.auth.isAuthenticated,
    requests: isNil(requestsIds) ? null : denormalize(
      requestsIds,
      DataboxSchema.collection,
      state.entities,
    )
      .map(({ producerId, ...rest }) => {
        // @FIXME: use specific schema
        const applicationById = denormalize(
          producerId,
          ApplicationByIdSchema.entity,
          state.entities,
        ) || {};
        return {
          ...rest,
          producerId,
          application: applicationById.application,
        };
      }),
  };
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  dispatchReceiveRequests: (data) => {
    const normalized = normalize(
      data,
      DataboxSchema.collection,
    );
    const { entities, result } = normalized;
    return Promise.all([
      dispatch(receiveEntities(entities), mergeReceiveNoEmpty),
      // To keep order returned by backend
      dispatch(setAllRequestIdsForStatus(result, ownProps.activeStatus)),
    ]);
  },
  dispatchReceiveApplications: (data) => {
    const normalized = normalize(
      data.map(({ id, ...rest }) => ({ id, application: { id, ...rest } })),
      ApplicationByIdSchema.collection,
    );
    const { entities } = normalized;
    dispatch(receiveEntities(entities, mergeReceiveNoEmpty));
  },
  dispatchUpdateEntities: (id, blobCount) => {
    const entities = [{ id, changes: { blobCount } }];
    dispatch(updateEntities(entities, DataboxSchema));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(UserRequestsList);
