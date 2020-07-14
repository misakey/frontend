import BoxesSchema from 'store/schemas/Boxes';
import { receiveEntities } from '@misakey/store/actions/entities';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import { selectors } from 'store/reducers/userBoxes/pagination';

import propOr from '@misakey/helpers/propOr';
import isNil from '@misakey/helpers/isNil';
import __ from '@misakey/helpers/__';
import { makeOffsetLimitFromRange } from '@misakey/helpers/offsetLimitRange';

import { getUserBoxesBuilder } from '@misakey/helpers/builder/boxes';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import { useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { normalize } from 'normalizr';
import { ALL } from 'constants/app/boxes/statuses';

// CONSTANTS
const EMPTY_OBJ = {};

// HELPERS
const selectorsProp = propOr(EMPTY_OBJ, __, selectors);

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

  const refresh = useCallback(
    () => {
      const toRefreshIndexes = Object.keys(byPagination).map(((index) => parseInt(index, 10)));
      const pagination = makeOffsetLimitFromRange(toRefreshIndexes);
      return getUserBoxesBuilder({ ...payload, ...pagination })
        .then((response) => dispatchRefreshBoxes(response.map(objectToCamelCase)));
    },
    [byPagination, dispatchRefreshBoxes, payload],
  );

  return refresh;
};
