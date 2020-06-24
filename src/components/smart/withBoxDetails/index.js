import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { denormalize, normalize } from 'normalizr';
import { connect, useSelector } from 'react-redux';
import { useRouteMatch, useHistory } from 'react-router-dom';
import routes from 'routes';

import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';

import isNil from '@misakey/helpers/isNil';
import identity from '@misakey/helpers/identity';
import { getBoxEventsBuilder, getBoxWithEventsBuilder, getBoxBuilder } from '@misakey/helpers/builder/boxes';

import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';

import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import BoxesSchema from 'store/schemas/Boxes';
import { updateEntities, receiveEntities } from '@misakey/store/actions/entities';
// import BlobSchema from 'store/schemas/Databox/Blob';
import EventsSchema from 'store/schemas/Boxes/Events';
import { getBoxMembersIds } from 'store/reducers/box';

import { OPEN } from 'constants/app/boxes/statuses';

// COMPONENTS
const withBoxDetails = (mapper = identity) => (Component) => {
  const Wrapper = (props) => {
    // Used to prevent refetch on delete box
    const [preventFetching, setPreventFetching] = useState(false);
    const handleGenericHttpErrors = useHandleGenericHttpErrors();

    const {
      isAuthenticated,
      box,
      dispatchReceiveBox,
      // dispatchReceiveBlobs,
      dispatchReceiveBoxEvents,
      ...rest
    } = props;

    const { id, events, lifecycle, creator } = useMemo(() => box || {}, [box]);
    const members = useSelector((state) => getBoxMembersIds(state, id));
    const isOpen = useMemo(() => lifecycle === OPEN, [lifecycle]);
    const { identifier } = useSelector(getCurrentUserSelector) || {};
    const belongsToCurrentUser = useMemo(
      () => (!isNil(identifier) && !isNil(creator)
        ? creator.identifier.value === identifier.value
        : false
      ),
      [creator, identifier],
    );

    const { params } = useRouteMatch();
    const history = useHistory();

    const isAllowedToFetch = useMemo(
      () => isAuthenticated && !isNil(params.id) && !preventFetching,
      [isAuthenticated, params.id, preventFetching],
    );

    const shouldFetchBox = useMemo(
      () => isAllowedToFetch && isNil(box),
      [isAllowedToFetch, box],
    );

    const isAllowedToFetchContent = useMemo(
      () => !shouldFetchBox && isAllowedToFetch && (isOpen || belongsToCurrentUser),
      [belongsToCurrentUser, isAllowedToFetch, isOpen, shouldFetchBox],
    );

    const shouldFetchEvents = useMemo(
      () => !shouldFetchBox && isAllowedToFetchContent && isNil(events),
      [shouldFetchBox, isAllowedToFetchContent, events],
    );

    // // Get blobIds from logs for which we need to fetch info (blobUrl, fileExtension...)
    // const missingBlobsInfo = useMemo(() => {
    //   if (isNil(events)) { return []; }
    //   return logs.reduce((blobIds, log) => {
    //     const { action, metadata } = log || {};
    //     if (isNil(metadata) || action !== UPLOADING) { return blobIds; }
    //     const { blob: { blobUrl } = {}, blobId } = metadata;
    //     return isNil(blobUrl) ? [...blobIds, blobId] : blobIds;
    //   }, []);
    // }, [logs]);

    // const shouldFetchBlobs = useMemo(
    //   () => !shouldFetchEvents && isAllowedToFetchContent && !isEmpty(missingBlobsInfo),
    //   [missingBlobsInfo, shouldFetchLogs],
    // );

    const getBoxWithEvents = useCallback(
      () => (isAllowedToFetchContent
        ? getBoxWithEventsBuilder(params.id)
        : getBoxBuilder(params.id)
      ),
      [isAllowedToFetchContent, params.id],
    );

    const getBoxEvents = useCallback(
      () => getBoxEventsBuilder(params.id),
      [params.id],
    );

    // const getRequestBlobs = useCallback(() => getRequestBlobsBuilder(id), [id]);

    const onReceiveBoxEvents = useCallback(
      (data) => dispatchReceiveBoxEvents(id, data),
      [dispatchReceiveBoxEvents, id],
    );

    const onError = useCallback(
      (error) => {
        handleGenericHttpErrors(error);
        // View is broken without box
        history.replace(routes._);
      },
      [handleGenericHttpErrors, history],
    );

    const { isFetching } = useFetchEffect(
      getBoxWithEvents,
      { shouldFetch: shouldFetchBox },
      { onSuccess: dispatchReceiveBox, onError },
    );

    const { isFetching: isFetchingEvents } = useFetchEffect(
      getBoxEvents,
      { shouldFetch: shouldFetchEvents },
      { onSuccess: onReceiveBoxEvents },
    );

    // const { isFetching: isFetchingBlobs } = useFetchEffect(
    //   getRequestBlobs,
    //   { shouldFetch: shouldFetchBlobs },
    //   { onSuccess: dispatchReceiveBlobs },
    // );

    const onDelete = useCallback(() => { setPreventFetching(true); }, []);

    const mappedProps = useMemo(
      () => (mapper({
        box: { ...box || { id: params.id }, members },
        belongsToCurrentUser,
        isFetching: {
          box: isFetching,
          events: isFetchingEvents,
          // blobs: isFetchingBlobs,
        },
        onDelete,
        isAuthenticated,
        ...rest,
      })),
      [belongsToCurrentUser, box, isAuthenticated, isFetching,
        isFetchingEvents, members, onDelete, params.id, rest],
    );

    return <Component {...mappedProps} />;
  };

  Wrapper.propTypes = {
    // CONNECT
    box: PropTypes.shape(BoxesSchema.propTypes),
    isAuthenticated: PropTypes.bool,
    dispatchReceiveBox: PropTypes.func.isRequired,
    // dispatchReceiveBlobs: PropTypes.func.isRequired,
    dispatchReceiveBoxEvents: PropTypes.func.isRequired,
  };

  Wrapper.defaultProps = {
    box: null,
    isAuthenticated: null,
  };

  // CONNECT
  const mapStateToProps = (state, ownProps) => ({
    box: denormalize(
      ownProps.match.params.id,
      BoxesSchema.entity,
      state.entities,
    ),
    isAuthenticated: state.auth.isAuthenticated,
  });

  const mapDispatchToProps = (dispatch) => ({
    dispatchReceiveBox: (data) => {
      const normalized = normalize(
        data,
        BoxesSchema.entity,
      );
      const { entities } = normalized;
      dispatch(receiveEntities(entities, mergeReceiveNoEmpty));
    },
    dispatchReceiveBoxEvents: (id, events) => {
      const normalized = normalize(
        events,
        EventsSchema.collection,
      );
      const { entities, result } = normalized;
      return Promise.all([
        dispatch(receiveEntities(entities, mergeReceiveNoEmpty)),
        dispatch(updateEntities([{ id, changes: { events: result } }], BoxesSchema)),
      ]);
    },
    // dispatchReceiveBlobs: (blobs) => {
    //   const normalized = normalize(
    //     blobs,
    //     BlobSchema.collection,
    //   );
    //   const { entities } = normalized;
    //   dispatch(receiveEntities(entities, mergeReceiveNoEmpty));
    // },
  });

  return connect(mapStateToProps, mapDispatchToProps)(Wrapper);
};

export default withBoxDetails;
