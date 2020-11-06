

import { useMemo, useCallback, useEffect, useState } from 'react';
import { normalize } from 'normalizr';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import routes from 'routes';

import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useBoxBelongsToCurrentUser from 'hooks/useBoxBelongsToCurrentUser';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import mergeDeepWithKey from '@misakey/helpers/mergeDeepWithKey';
import { getBoxBuilder, getBoxMembersBuilder } from '@misakey/helpers/builder/boxes';

import { noEmptyOverride, mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import BoxesSchema from 'store/schemas/Boxes';
import { updateEntities, receiveEntities } from '@misakey/store/actions/entities';
import SenderSchema from 'store/schemas/Boxes/Sender';

import { makeDenormalizeBoxSelector, receiveJoinedBox } from 'store/reducers/box';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';
import { CLOSED } from 'constants/app/boxes/statuses';
import useOnError from './onError';

// CONSTANTS
const { isAuthenticated: IS_AUTHENTICATED_SELECTOR } = authSelectors;

// HELPERS
const noEmptyNoEventsCountOverride = (key, oldValue, newValue) => {
  if (key === 'eventsCount') {
    if (!isNil(oldValue) && newValue === 0) {
      return oldValue;
    }
    return noEmptyOverride(oldValue, newValue);
  }
  return noEmptyOverride(oldValue, newValue);
};

const mergeReceiveNoEmptyNoEventsCountOverride = (state, { entities }) => {
  let newState = { ...state };
  Object.entries(entities).forEach(([entityName, entity]) => {
    newState = {
      ...newState,
      [entityName]: mergeDeepWithKey(noEmptyNoEventsCountOverride, state[entityName], entity),
    };
  });
  return newState;
};

// HOOKS
export default (id) => {
  const dispatch = useDispatch();
  const [isFetching, setIsFetching] = useState(false);

  const denormalizeBoxSelector = useMemo(
    () => makeDenormalizeBoxSelector(),
    [],
  );

  const box = useSelector((state) => denormalizeBoxSelector(state, id));

  const { members, hasAccess, isMember, publicKey, lifecycle } = useSafeDestr(box);

  const belongsToCurrentUser = useBoxBelongsToCurrentUser(box);

  const handleHttpErrors = useHandleHttpErrors();

  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);

  const history = useHistory();

  const isAllowedToFetch = useMemo(
    () => isAuthenticated && !isNil(id) && !isFetching,
    [isAuthenticated, id, isFetching],
  );

  const hasAccessAndIsMember = useMemo(
    () => hasAccess === true && isMember === true,
    [hasAccess, isMember],
  );

  const isClosed = useMemo(() => lifecycle === CLOSED, [lifecycle]);

  const isAllowedToFetchContent = useMemo(
    () => isAllowedToFetch && hasAccessAndIsMember && (!isClosed || belongsToCurrentUser),
    [isAllowedToFetch, hasAccessAndIsMember, isClosed, belongsToCurrentUser],
  );

  const shouldFetchBox = useMemo(
    () => isNil(box) || isNil(hasAccess) || (isNil(publicKey) && hasAccessAndIsMember),
    [box, hasAccess, hasAccessAndIsMember, publicKey],
  );

  const getBox = useCallback(
    () => getBoxBuilder(id),
    [id],
  );

  const getBoxMembers = useCallback(
    () => getBoxMembersBuilder(id),
    [id],
  );

  const dispatchReceiveJoinedBox = useCallback(
    (data) => Promise.resolve(dispatch(
      receiveJoinedBox(data, mergeReceiveNoEmptyNoEventsCountOverride),
    )),
    [dispatch],
  );

  const onSuccess = useCallback(
    (result) => dispatchReceiveJoinedBox(result),
    [dispatchReceiveJoinedBox],
  );

  const onDefaultError = useCallback(
    (error) => {
      handleHttpErrors(error);
      // View is broken without box
      history.replace(routes._);
    },
    [handleHttpErrors, history],
  );

  const onError = useOnError(id, onDefaultError);

  useEffect(
    () => {
      if (isAllowedToFetch && shouldFetchBox) {
        setIsFetching(true);
        getBox().then(onSuccess).catch(onError).finally(() => setIsFetching(false));
      }
    },
    [getBox, isAllowedToFetch, onError, onSuccess, shouldFetchBox],
  );

  const shouldFetchMembers = useMemo(
    () => isAllowedToFetchContent && isEmpty(members),
    [isAllowedToFetchContent, members],
  );

  const dispatchReceiveBoxMembers = useCallback(
    (data) => {
      const normalized = normalize(
        data,
        SenderSchema.collection,
      );
      const { entities, result } = normalized;
      return Promise.all([
        dispatch(receiveEntities(entities, mergeReceiveNoEmpty)),
        dispatch(updateEntities([{ id, changes: { members: result } }], BoxesSchema)),
      ]);
    },
    [dispatch, id],
  );

  const { isFetching: isFetchingMembers } = useFetchEffect(
    getBoxMembers,
    { shouldFetch: shouldFetchMembers },
    { onSuccess: dispatchReceiveBoxMembers },
  );

  const isReady = useMemo(
    () => !isNil(box) && !isNil(hasAccess),
    [box, hasAccess],
  );

  return {
    isReady,
    isFetchingMembers,
    box,
  };
};
