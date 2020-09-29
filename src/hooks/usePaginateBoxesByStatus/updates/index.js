import { mergeReceiveNoEmpty, mergeReceiveNoEmptyNullable } from '@misakey/store/reducers/helpers/processStrategies';
import { selectors, actionCreators, moveBackUpId } from 'store/reducers/userBoxes/pagination';
import { removeBoxSecretKeysAndKeyShares } from '@misakey/crypto/store/actions/concrete';
import { removeBox, receiveJoinedBox } from 'store/reducers/box';

import propOr from '@misakey/helpers/propOr';
import isNil from '@misakey/helpers/isNil';
import noop from '@misakey/helpers/noop';
import __ from '@misakey/helpers/__';

import { useMemo, useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import useBoxPublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/useBoxPublicKeysWeCanDecryptFrom';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { ALL } from 'constants/app/boxes/statuses';

// CONSTANTS
const EMPTY_OBJ = {};

// HELPERS
const selectorsProp = propOr(EMPTY_OBJ, __, selectors);
const actionCreatorsProp = propOr(EMPTY_OBJ, __, actionCreators);

const getAddPaginatedIdActionCreator = (status) => {
  const statusActionCreators = actionCreatorsProp(status);
  return statusActionCreators.addPaginatedId || noop;
};

const getRemovePaginatedIdActionCreator = (status) => {
  const statusActionCreators = actionCreatorsProp(status);
  return statusActionCreators.removePaginatedId || noop;
};

// HOOKS
export const useOnRemoveBox = (status = ALL, search = null) => {
  const hasSearch = useMemo(() => !isNil(search), [search]);
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

  // ACTIONS
  const removePaginatedIdAction = useMemo(
    () => getRemovePaginatedIdActionCreator(status),
    [status],
  );

  // DISPATCH
  const dispatch = useDispatch();

  const dispatchRemoveBox = useCallback(
    ({ id, publicKey }) => {
      const secretKey = publicKeysRef.current.get(publicKey);
      return Promise.all([
        dispatch(removeBox(id)),
        dispatch(removeBoxSecretKeysAndKeyShares({
          secretKeys: [secretKey],
          boxIds: [id],
        }))
          .catch(() => {
            enqueueSnackbar(errorBackup, { variant: 'error' });
          }),
      ]);
    },
    [dispatch, enqueueSnackbar, errorBackup, publicKeysRef],
  );

  const dispatchRemovePaginatedBox = useCallback(
    (box) => {
      const { id } = box;
      return dispatchRemoveBox(box)
        .then(() => Promise.resolve(dispatch(removePaginatedIdAction(id, search))));
    },
    [dispatch, dispatchRemoveBox, removePaginatedIdAction, search],
  );
  // SELECTORS
  const statusSelectors = useMemo(
    () => selectorsProp(status),
    [status],
  );

  const byPaginationSelector = useMemo(
    () => (hasSearch ? statusSelectors.getBySearchPagination : statusSelectors.getByPagination),
    [hasSearch, statusSelectors.getByPagination, statusSelectors.getBySearchPagination],
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
        ? dispatchRemovePaginatedBox(box)
        : dispatchRemoveBox(box);
    },
    [dispatchRemoveBox, dispatchRemovePaginatedBox, byPaginationRef],
  );
};

export const useOnReceiveBox = (status = ALL, search = null) => {
  const hasSearch = useMemo(() => !isNil(search), [search]);

  // ACTIONS
  const addPaginatedIdAction = useMemo(
    () => getAddPaginatedIdActionCreator(status),
    [status],
  );


  // DISPATCH
  const dispatch = useDispatch();

  const dispatchReceiveBox = useCallback(
    (box) => Promise.resolve(dispatch(receiveJoinedBox(box, mergeReceiveNoEmptyNullable)))
      .then(() => Promise.resolve(dispatch(moveBackUpId(box.id, status)))),
    [dispatch, status],
  );

  const dispatchAddBox = useCallback(
    (box) => Promise.resolve(dispatch(receiveJoinedBox(box, mergeReceiveNoEmpty)))
      .then(({ result }) => Promise.resolve(dispatch(addPaginatedIdAction(result, search)))),
    [addPaginatedIdAction, dispatch, search],
  );

  // SELECTORS
  const statusSelectors = useMemo(
    () => selectorsProp(status),
    [status],
  );

  const byPaginationSelector = useMemo(
    () => (hasSearch ? statusSelectors.getBySearchPagination : statusSelectors.getByPagination),
    [hasSearch, statusSelectors.getByPagination, statusSelectors.getBySearchPagination],
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
