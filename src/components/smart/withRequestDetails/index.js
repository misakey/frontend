import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { denormalize, normalize } from 'normalizr';
import routes from 'routes';

import useFetchEffect from '@misakey/hooks/useFetch/effect';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import identity from '@misakey/helpers/identity';
import { getRequestLogsBuilder, getRequestWithLogsBuilder, getRequestBlobsBuilder } from '@misakey/helpers/builder/requests';
import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';

import DataboxSchema from 'store/schemas/Databox';
import { updateEntities, receiveEntities } from '@misakey/store/actions/entities';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import { connect } from 'react-redux';
import { useRouteMatch, useHistory } from 'react-router-dom';
import { UPLOADING } from 'constants/databox/event';
import BlobSchema from 'store/schemas/Databox/Blob';
import ActivityLogsSchema from 'store/schemas/Databox/ActivityLogs';

// COMPONENTS
const withRequestDetails = (mapper = identity) => (Component) => {
  const Wrapper = (props) => {
    // Used to prevent refetch on delete request
    const [preventFetching, setPreventFetching] = useState(false);
    const handleGenericHttpErrors = useHandleGenericHttpErrors();

    const {
      isAuthenticated,
      request,
      dispatchReceiveRequest,
      dispatchReceiveBlobs,
      dispatchReceiveRequestLogs,
      ...rest
    } = props;

    const { id, logs } = useMemo(() => request || {}, [request]);

    const { params } = useRouteMatch();
    const history = useHistory();

    const isAllowedToFetch = useMemo(
      () => isAuthenticated && !isNil(params.id) && !preventFetching,
      [isAuthenticated, params.id, preventFetching],
    );

    const shouldFetchRequest = useMemo(
      () => isAllowedToFetch && isNil(request),
      [isAllowedToFetch, request],
    );

    const shouldFetchLogs = useMemo(
      () => !shouldFetchRequest && isAllowedToFetch && isNil(logs),
      [isAllowedToFetch, logs, shouldFetchRequest],
    );

    // Get blobIds from logs for which we need to fetch info (blobUrl, fileExtension...)
    const missingBlobsInfo = useMemo(() => {
      if (isNil(logs)) { return []; }
      return logs.reduce((blobIds, log) => {
        const { action, metadata } = log || {};
        if (isNil(metadata) || action !== UPLOADING) { return blobIds; }
        const { blob: { blobUrl } = {}, blobId } = metadata;
        return isNil(blobUrl) ? [...blobIds, blobId] : blobIds;
      }, []);
    }, [logs]);

    const shouldFetchBlobs = useMemo(
      () => !shouldFetchLogs && !isEmpty(missingBlobsInfo),
      [missingBlobsInfo, shouldFetchLogs],
    );

    const getRequestWithLogs = useCallback(
      () => getRequestWithLogsBuilder(params.id),
      [params.id],
    );

    const getRequestLogs = useCallback(
      () => getRequestLogsBuilder(params.id),
      [params.id],
    );

    const getRequestBlobs = useCallback(() => getRequestBlobsBuilder(id), [id]);

    const onReceiveRequestLogs = useCallback(
      (data) => dispatchReceiveRequestLogs(id, data),
      [dispatchReceiveRequestLogs, id],
    );

    const onError = useCallback(
      (error) => {
        handleGenericHttpErrors(error);
        // View is broken without request
        history.replace(routes._);
      },
      [handleGenericHttpErrors, history],
    );

    const { isFetching } = useFetchEffect(
      getRequestWithLogs,
      { shouldFetch: shouldFetchRequest },
      { onSuccess: dispatchReceiveRequest, onError },
    );

    const { isFetching: isFetchingLogs } = useFetchEffect(
      getRequestLogs,
      { shouldFetch: shouldFetchLogs },
      { onSuccess: onReceiveRequestLogs },
    );

    const { isFetching: isFetchingBlobs } = useFetchEffect(
      getRequestBlobs,
      { shouldFetch: shouldFetchBlobs },
      { onSuccess: dispatchReceiveBlobs },
    );

    const onDelete = useCallback(() => { setPreventFetching(true); }, []);

    const mappedProps = useMemo(
      () => (mapper({
        request,
        isFetching: {
          request: isFetching,
          logs: isFetchingLogs,
          blobs: isFetchingBlobs,
        },
        onDelete,
        isAuthenticated,
        ...rest,
      })),
      [isAuthenticated, isFetching, isFetchingBlobs, isFetchingLogs, onDelete, request, rest],
    );

    return <Component {...mappedProps} />;
  };

  Wrapper.propTypes = {
    // CONNECT
    request: PropTypes.shape(DataboxSchema.propTypes),
    isAuthenticated: PropTypes.bool,
    dispatchReceiveRequest: PropTypes.func.isRequired,
    dispatchReceiveBlobs: PropTypes.func.isRequired,
    dispatchReceiveRequestLogs: PropTypes.func.isRequired,
  };

  Wrapper.defaultProps = {
    request: null,
    isAuthenticated: null,
  };

  // CONNECT
  const mapStateToProps = (state, ownProps) => ({
    request: denormalize(
      ownProps.match.params.id,
      DataboxSchema.entity,
      state.entities,
    ),
    isAuthenticated: state.auth.isAuthenticated,
  });

  const mapDispatchToProps = (dispatch) => ({
    dispatchReceiveRequest: (data) => {
      const normalized = normalize(
        data,
        DataboxSchema.entity,
      );
      const { entities } = normalized;
      dispatch(receiveEntities(entities, mergeReceiveNoEmpty));
    },
    dispatchReceiveRequestLogs: (id, logs) => {
      const normalized = normalize(
        logs,
        ActivityLogsSchema.collection,
      );
      const { entities, result } = normalized;
      return Promise.all([
        dispatch(receiveEntities(entities, mergeReceiveNoEmpty)),
        dispatch(updateEntities([{ id, changes: { logs: result } }], DataboxSchema)),
      ]);
    },
    dispatchReceiveBlobs: (blobs) => {
      const normalized = normalize(
        blobs,
        BlobSchema.collection,
      );
      const { entities } = normalized;
      dispatch(receiveEntities(entities, mergeReceiveNoEmpty));
    },
  });


  return connect(mapStateToProps, mapDispatchToProps)(Wrapper);
};

export default withRequestDetails;
