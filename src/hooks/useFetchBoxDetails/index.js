

import { useMemo, useCallback } from 'react';
import { normalize } from 'normalizr';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import routes from 'routes';

import errorTypes from '@misakey/ui/constants/errorTypes';

import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import usePropChanged from '@misakey/hooks/usePropChanged';

import { getCode, getDetails } from '@misakey/helpers/apiError';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import { getBoxBuilder, getBoxMembersBuilder } from '@misakey/helpers/builder/boxes';

import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import BoxesSchema from 'store/schemas/Boxes';
import { updateEntities, receiveEntities } from '@misakey/store/actions/entities';
import SenderSchema from 'store/schemas/Boxes/Sender';

import { makeDenormalizeBoxSelector, receiveJoinedBox } from 'store/reducers/box';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';
import { CLOSED } from 'constants/app/boxes/statuses';

// CONSTANTS
const { forbidden } = errorTypes;
const NOT_MEMBER = 'not_member';
const NO_ACCESS = 'no_access';
const ERR_BOX_CLOSED = 'closed';
const { isAuthenticated: IS_AUTHENTICATED_SELECTOR } = authSelectors;

export default (id) => {
  const dispatch = useDispatch();

  const denormalizeBoxSelector = useMemo(
    () => makeDenormalizeBoxSelector(),
    [],
  );

  const box = useSelector((state) => denormalizeBoxSelector(state, id));

  const { members, hasAccess, isMember, id: boxId } = useSafeDestr(box);

  const [idPropChanged] = usePropChanged(id, [boxId]);

  const handleHttpErrors = useHandleHttpErrors();

  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);

  const history = useHistory();

  const isAllowedToFetch = useMemo(
    () => isAuthenticated && !isNil(id),
    [isAuthenticated, id],
  );

  const isAllowedToFetchContent = useMemo(
    () => isAllowedToFetch && hasAccess === true && isMember === true,
    [isAllowedToFetch, hasAccess, isMember],
  );

  const shouldFetchBox = useMemo(
    () => isAllowedToFetch && (isNil(box) || isNil(hasAccess)),
    [isAllowedToFetch, box, hasAccess],
  );

  const getBox = useCallback(
    () => getBoxBuilder(id),
    [id],
  );

  const getBoxMembers = useCallback(
    () => getBoxMembersBuilder(id),
    [id],
  );

  const dispatchReceiveBox = useCallback(
    (data) => {
      const normalized = normalize(data, BoxesSchema.entity);
      const { entities } = normalized;
      return Promise.resolve(dispatch(receiveEntities(entities, mergeReceiveNoEmpty)));
    },
    [dispatch],
  );

  const dispatchReceiveJoinedBox = useCallback(
    (data) => Promise.resolve(dispatch(receiveJoinedBox(data, mergeReceiveNoEmpty))),
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

  const onError = useCallback(
    async (error) => {
      const code = getCode(error);
      const { reason } = getDetails(error);
      if (code === forbidden) {
        switch (reason) {
          case NOT_MEMBER: {
            dispatchReceiveBox({ id, isMember: false, hasAccess: true });
            break;
          }
          case NO_ACCESS: {
            dispatchReceiveBox({ id, hasAccess: false });
            break;
          }
          case ERR_BOX_CLOSED: {
            dispatchReceiveBox({ id, hasAccess: true, lifecycle: CLOSED });
            break;
          }
          default: {
            onDefaultError(error);
          }
        }
      } else {
        onDefaultError(error);
      }
    },
    [dispatchReceiveBox, id, onDefaultError],
  );

  useFetchEffect(
    getBox,
    { shouldFetch: shouldFetchBox, stopOnError: !idPropChanged },
    { onSuccess, onError },
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
