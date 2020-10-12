import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { mergeReceiveNoEmpty, mergeReceiveNoEmptyNullable } from '@misakey/store/reducers/helpers/processStrategies';
import { selectors, actionCreators, moveBackUpId } from 'store/reducers/userBoxes/pagination';
import { removeBox, receiveJoinedBox } from 'store/reducers/box';
import { removeBoxSecretKeysAndKeyShares } from '@misakey/crypto/store/actions/concrete';

import isNil from '@misakey/helpers/isNil';

import { useMemo, useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector, batch } from 'react-redux';
import useBoxPublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/useBoxPublicKeysWeCanDecryptFrom';

import { ALL } from 'constants/app/boxes/statuses';
import execWithRequestIdleCallback from 'packages/helpers/src/execWithRequestIdleCallback';

// ACTIONS
const { removePaginatedId, addPaginatedId } = actionCreators;
const { getBySearchPagination, getByPagination } = selectors;

// HOOKS
export const useOnRemoveBox = (status = ALL, search = null) => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('boxes');

  const publicKeysWeCanDecryptFrom = useBoxPublicKeysWeCanDecryptFrom();
  const publicKeysRef = useRef(publicKeysWeCanDecryptFrom);

  const errorBackup = useMemo(
    () => t('boxes:removeBox.updateBackup.error'),
    [t],
  );

  useEffect(
    () => {
      publicKeysRef.current = publicKeysWeCanDecryptFrom;
    },
    [publicKeysWeCanDecryptFrom, publicKeysRef],
  );

  // DISPATCH
  const dispatch = useDispatch();

  const cleanBackup = useCallback(
    ({ id, publicKey }) => {
      if (!isNil(publicKey)) {
        const secretKey = publicKeysRef.current.get(publicKey);
        dispatch(removeBoxSecretKeysAndKeyShares({
          secretKeys: [secretKey],
          boxIds: [id],
        }))
          .catch(() => {
            enqueueSnackbar(errorBackup, { variant: 'error' });
          });
      }
    },
    [dispatch, enqueueSnackbar, errorBackup],
  );

  const dispatchRemovePaginatedBox = useCallback(
    (boxId) => batch(async () => {
      dispatch(removePaginatedId(status, boxId, search));
      const box = await Promise.resolve(dispatch(removeBox(boxId)));
      // Cleanup has not priority regarding fluidity of the app
      // @FIXME we could maybe not clean at all as many other cases are not handled and implement a
      // clean and sure way to update the backup, with crypto actions
      execWithRequestIdleCallback(() => cleanBackup(box), undefined, /* abortIfUnavailable */ true);
      return box;
    }),
    [cleanBackup, dispatch, search, status],
  );

  return dispatchRemovePaginatedBox;
};

export const useOnReceiveBox = (status = ALL, search = null) => {
  const hasSearch = useMemo(() => !isNil(search), [search]);

  // DISPATCH
  const dispatch = useDispatch();

  const dispatchReceiveBox = useCallback(
    (box) => Promise.resolve(dispatch(receiveJoinedBox(box, mergeReceiveNoEmptyNullable)))
      .then(() => Promise.resolve(dispatch(moveBackUpId(box.id, status)))),
    [dispatch, status],
  );

  const dispatchAddBox = useCallback(
    (box) => Promise.resolve(dispatch(receiveJoinedBox(box, mergeReceiveNoEmpty)))
      .then(({ result }) => Promise.resolve(dispatch(addPaginatedId(status, result, search)))),
    [dispatch, search, status],
  );

  // SELECTORS
  const byPaginationSelector = useMemo(
    () => (hasSearch ? getBySearchPagination : getByPagination),
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
