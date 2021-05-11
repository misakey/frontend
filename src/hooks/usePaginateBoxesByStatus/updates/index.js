import { mergeReceiveNoEmptyNullable } from '@misakey/store/reducers/helpers/processStrategies';
import { selectors, actionCreators, moveBackUpId } from 'store/reducers/userBoxes/pagination';
import { removeBox, receiveJoinedBox, addJoinedBox } from 'store/reducers/box';
import deleteSecrets from '@misakey/react/crypto/store/actions/deleteSecrets';

import isNil from '@misakey/core/helpers/isNil';

import { useMemo, useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector, batch } from 'react-redux';

import execWithRequestIdleCallback from '@misakey/core/helpers/execWithRequestIdleCallback';

// ACTIONS
const { removePaginatedId } = actionCreators;
const { makeGetBySearchPagination, makeGetByPagination } = selectors;

// HOOKS
export const useOnRemoveBox = (filterId, search = null) => {
  const dispatch = useDispatch();

  const cleanBackup = useCallback(
    ({ id, publicKey }) => {
      dispatch(deleteSecrets({
        asymPublicKeys: [publicKey],
        boxKeySharesBoxIds: [id],
      }));
    },
    [dispatch],
  );

  const dispatchRemovePaginatedBox = useCallback(
    (boxId) => batch(async () => {
      dispatch(removePaginatedId(filterId, boxId, search));
      const box = await Promise.resolve(dispatch(removeBox(boxId)));
      // Cleanup has not priority regarding fluidity of the app
      // @FIXME we could maybe not clean at all as many other cases are not handled and implement a
      // clean and sure way to update the backup, with crypto actions
      execWithRequestIdleCallback(() => cleanBackup(box), undefined, /* abortIfUnavailable */ true);
      return box;
    }),
    [cleanBackup, dispatch, filterId, search],
  );

  return dispatchRemovePaginatedBox;
};

export const useOnReceiveBox = (filterId, search = null) => {
  const hasSearch = useMemo(() => !isNil(search), [search]);

  // DISPATCH
  const dispatch = useDispatch();

  const dispatchReceiveBox = useCallback(
    (box) => Promise.resolve(dispatch(receiveJoinedBox(box, mergeReceiveNoEmptyNullable)))
      .then(() => Promise.resolve(dispatch(moveBackUpId(box.id, filterId)))),
    [dispatch, filterId],
  );

  const dispatchAddBox = useCallback(
    (box) => Promise.resolve(dispatch(addJoinedBox(box, filterId, search))),
    [dispatch, search, filterId],
  );

  // SELECTORS
  const byPaginationSelector = useMemo(
    () => (hasSearch ? makeGetBySearchPagination() : makeGetByPagination()),
    [hasSearch],
  );
  // hook with memoization layer
  const byPagination = useSelector(byPaginationSelector);

  const byPaginationRef = useRef(byPagination);

  useEffect(
    () => {
      byPaginationRef.current = byPagination;
    },
    [byPaginationRef, byPagination],
  );

  return useCallback(
    (box) => {
      const { id } = box;
      const paginated = Object.values(byPaginationRef.current)
        .find((paginatedId) => paginatedId === id);
      const isPaginated = !isNil(paginated);
      return isPaginated
        ? dispatchReceiveBox(box)
        : dispatchAddBox(box);
    },
    [dispatchAddBox, dispatchReceiveBox, byPaginationRef],
  );
};
