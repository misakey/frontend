import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { denormalize, normalize } from 'normalizr';
import { connect, useSelector } from 'react-redux';
import { useRouteMatch, useHistory } from 'react-router-dom';
import routes from 'routes';

import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

import isNil from '@misakey/helpers/isNil';
import pluck from '@misakey/helpers/pluck';
import identity from '@misakey/helpers/identity';
import { getBoxEventsBuilder, getBoxWithEventsBuilder, getBoxBuilder } from '@misakey/helpers/builder/boxes';

import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';

import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import BoxesSchema from 'store/schemas/Boxes';
import { updateEntities, receiveEntities } from '@misakey/store/actions/entities';
import EventsSchema from 'store/schemas/Boxes/Events';
import { getBoxMembersIds } from 'store/reducers/box';

import { OPEN } from 'constants/app/boxes/statuses';

// HELPERS
const pluckIds = pluck('id');

// COMPONENTS
const withBoxDetails = (mapper = identity) => (Component) => {
  const Wrapper = (props) => {
    // Used to prevent refetch on delete box
    const [preventFetching, setPreventFetching] = useState(false);
    const handleHttpErrors = useHandleHttpErrors();

    const {
      isAuthenticated,
      box,
      dispatchReceiveBox,
      dispatchReceiveBoxEvents,
      ...rest
    } = props;

    const { id, events, lifecycle, creator, lastEvent } = useMemo(() => box || {}, [box]);
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

    const isLastEventNew = useMemo(
      () => {
        if (!isNil(events) && !isNil(lastEvent)) {
          const eventIds = pluckIds(events);
          return !eventIds.includes(lastEvent.id);
        }
        return false;
      },
      [events, lastEvent],
    );

    const shouldFetchEvents = useMemo(
      () => !shouldFetchBox && isAllowedToFetchContent && (isNil(events) || isLastEventNew),
      [shouldFetchBox, isAllowedToFetchContent, events, isLastEventNew],
    );

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

    const onReceiveBoxEvents = useCallback(
      (data) => dispatchReceiveBoxEvents(id, data),
      [dispatchReceiveBoxEvents, id],
    );

    const onError = useCallback(
      (error) => {
        handleHttpErrors(error);
        // View is broken without box
        history.replace(routes._);
      },
      [handleHttpErrors, history],
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

    const onDelete = useCallback(() => { setPreventFetching(true); }, []);

    const mappedProps = useMemo(
      () => (mapper({
        box: { ...box || { id: params.id }, members },
        belongsToCurrentUser,
        isFetching: {
          box: isFetching,
          events: isFetchingEvents,
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
  });

  return connect(mapStateToProps, mapDispatchToProps)(Wrapper);
};

export default withBoxDetails;
