

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
import { useBoxesContext } from 'components/smart/Context/Boxes';

import { getCode, getDetails } from '@misakey/helpers/apiError';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import { getBoxBuilder, getBoxMembersBuilder, createBoxEventBuilder } from '@misakey/helpers/builder/boxes';

import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import BoxesSchema from 'store/schemas/Boxes';
import { updateEntities, receiveEntities } from '@misakey/store/actions/entities';
import SenderSchema from 'store/schemas/Boxes/Sender';

import { MEMBER_JOIN } from 'constants/app/boxes/events';
import { makeDenormalizeBoxSelector } from 'store/reducers/box';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

// CONSTANTS
const { forbidden } = errorTypes;
const NOT_MEMBER = 'not_member';
const NO_ACCESS = 'no_access';
const { isAuthenticated: IS_AUTHENTICATED_SELECTOR } = authSelectors;

export default (id) => {
  const dispatch = useDispatch();

  const denormalizeBoxSelector = useMemo(
    () => makeDenormalizeBoxSelector(),
    [],
  );

  const { addBoxItem } = useBoxesContext();

  const box = useSelector((state) => denormalizeBoxSelector(state, id));

  const { members, hasAccess, id: boxId } = useSafeDestr(box);

  const [idPropChanged] = usePropChanged(id, [boxId]);

  const handleHttpErrors = useHandleHttpErrors();

  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);

  const history = useHistory();

  const isAllowedToFetch = useMemo(
    () => isAuthenticated && !isNil(id),
    [isAuthenticated, id],
  );

  const isAllowedToFetchContent = useMemo(
    () => isAllowedToFetch && hasAccess === true,
    [isAllowedToFetch, hasAccess],
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

  const onSuccess = useCallback(
    (result) => dispatchReceiveBox({ ...result, id, isMember: true, hasAccess: true }),
    [dispatchReceiveBox, id],
  );

  const postJoinEvent = useCallback(
    () => createBoxEventBuilder(id, { type: MEMBER_JOIN })
      .then(() => getBox().then((result) => onSuccess(result)
        .then(() => addBoxItem(result))))
      .catch((e) => {
        handleHttpErrors(e);
        // View is broken without box membership
        history.replace(routes._);
      }),
    [addBoxItem, getBox, handleHttpErrors, history, id, onSuccess],
  );

  const onError = useCallback(
    async (error) => {
      const code = getCode(error);
      const { reason } = getDetails(error);
      if (code === forbidden && reason === NOT_MEMBER) {
        dispatchReceiveBox({ id, isMember: false });
        await postJoinEvent();
      } else if (code === forbidden && reason === NO_ACCESS) {
        dispatchReceiveBox({ id, hasAccess: false });
      } else {
        handleHttpErrors(error);
        // View is broken without box
        history.replace(routes._);
      }
    },
    [dispatchReceiveBox, id, postJoinEvent, handleHttpErrors, history],
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
