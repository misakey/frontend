import BoxesSchema from 'store/schemas/Boxes';
import { receiveEntities } from '@misakey/store/actions/entities';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import { selectors, actionCreators } from 'store/reducers/userBoxes/pagination';

import propOr from '@misakey/helpers/propOr';
import isNil from '@misakey/helpers/isNil';
import noop from '@misakey/helpers/noop';
import __ from '@misakey/helpers/__';
import { makeOffsetLimitFromRange } from '@misakey/helpers/offsetLimitRange';

import { getUserBoxesBuilder, countUserBoxesBuilder } from '@misakey/helpers/builder/boxes';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import { useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getReceiveItemCountActionCreator } from 'hooks/usePaginateBoxesByStatus';

import { normalize } from 'normalizr';
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

// HOOKS
export default (status = ALL, search = null) => {
  const hasSearch = useMemo(() => !isNil(search), [search]);

  // payload for API
  const payload = useMemo(
    () => ({
      ...(hasSearch ? { search } : {}),
      ...(status !== ALL ? { statuses: [status] } : {}),
    }),
    [hasSearch, search, status],
  );

  // ACTIONS
  const receiveItemCountAction = useMemo(
    () => getReceiveItemCountActionCreator(status),
    [status],
  );

  const addPaginatedIdAction = useMemo(
    () => getAddPaginatedIdActionCreator(status),
    [status],
  );

  // DISPATCH
  const dispatch = useDispatch();

  const dispatchRefreshBoxes = useCallback(
    (data) => {
      const normalized = normalize(
        data,
        BoxesSchema.collection,
      );
      const { entities } = normalized;
      return Promise.resolve(dispatch(receiveEntities(entities, mergeReceiveNoEmpty)));
    },
    [dispatch],
  );

  const dispatchAddBox = useCallback(
    (data) => {
      const normalized = normalize(
        data,
        BoxesSchema.entity,
      );
      const { entities, result } = normalized;
      return Promise.all([
        dispatch(receiveEntities(entities, mergeReceiveNoEmpty)),
        dispatch(addPaginatedIdAction(result)),
      ]);
    },
    [addPaginatedIdAction, dispatch],
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

  const refreshBoxes = useCallback(
    (data) => getUserBoxesBuilder(data)
      .then((response) => dispatchRefreshBoxes(response.map(objectToCamelCase))),
    [dispatchRefreshBoxes],
  );

  const refreshItemCount = useCallback(
    (data) => countUserBoxesBuilder(data)
      .then((result) => dispatch(receiveItemCountAction(result))),
    [dispatch, receiveItemCountAction],
  );

  const refresh = useCallback(
    () => {
      const toRefreshIndexes = Object.keys(byPagination).map(((index) => parseInt(index, 10)));
      const pagination = makeOffsetLimitFromRange(toRefreshIndexes);
      return Promise.all([
        refreshBoxes({ ...payload, ...pagination }),
        refreshItemCount({ ...payload, ...pagination }),
      ]);
    },
    [byPagination, payload, refreshBoxes, refreshItemCount],
  );

  const addBoxItem = useCallback(
    (item) => Promise.resolve(dispatchAddBox(item)),
    [dispatchAddBox],
  );

  return useMemo(() => ({
    refresh,
    addBoxItem,
  }),
  [addBoxItem, refresh]);
};
