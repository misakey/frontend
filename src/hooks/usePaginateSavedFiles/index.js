
import { useMemo, useCallback, useEffect } from 'react';
import { useDispatch, useSelector, batch } from 'react-redux';
import { normalize } from 'normalizr';

import { actionCreators, selectors } from 'store/reducers/savedFiles/pagination';
import SavedFilesSchema from 'store/schemas/Files/Saved';
import { receiveEntities } from '@misakey/store/actions/entities';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import pickAll from '@misakey/helpers/pickAll';
import isNil from '@misakey/helpers/isNil';
import { makeOffsetLimitFromRange, makeRangeFromOffsetLimit } from '@misakey/helpers/offsetLimitRange';
import { getSavedFilesBuilder, countSavedFilesBuilder } from '@misakey/helpers/builder/vault';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import getMissingIndexes from '@misakey/helpers/getMissingIndexes';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

// CONSTANTS
const { receivePaginatedItemCount, receivePaginatedIds } = actionCreators;
const { getByPagination, getItemCount } = selectors;

// HOOKS
/**
 * @returns {{byPagination: Object, itemCount: Number, loadMoreItems: Function}}
 * where:
 * - byPagination is a map of paginated elements
 * - itemCount is the total number of elements
 * - loadMoreItems is a function to call to ask for more items
 */
export default () => {
  const handleHttpErrors = useHandleHttpErrors();
  const identityId = useSelector(authSelectors.identityId);

  const dispatch = useDispatch();

  // SELECTORS hooks with memoization layer
  const byPagination = useSelector((state) => getByPagination(state, identityId));
  const itemCount = useSelector((state) => getItemCount(state, identityId));
  // ---

  const dispatchReceived = useCallback(
    (data, { offset, limit }) => {
      const normalized = normalize(
        data,
        SavedFilesSchema.collection,
      );
      const { entities, result } = normalized;

      batch(() => {
        dispatch(receiveEntities(entities, mergeReceiveNoEmpty));
        dispatch(receivePaginatedIds(identityId, offset, limit, result));
      });
    },
    [dispatch, identityId],
  );

  // API data fetching:
  // get files events
  const get = useCallback(
    (pagination) => getSavedFilesBuilder({ identityId, ...pagination })
      .then((response) => dispatchReceived(response.map(objectToCamelCase), pagination)),
    [dispatchReceived, identityId],
  );

  // called by react-window lists
  // decides whenever API calls are needed
  const loadMoreItems = useCallback(
    (pagination) => {
      const askedPagination = makeRangeFromOffsetLimit(pagination);
      const pickedIndexes = pickAll(askedPagination, byPagination);
      const paginatedIds = Object.values(pickedIndexes)
        .filter((pickedIndex) => !isNil(pickedIndex));
      // when asked data is already in store
      if (askedPagination.length === paginatedIds.length) {
        return Promise.resolve();
      }
      const missingIndexes = getMissingIndexes(pickedIndexes).map(((index) => parseInt(index, 10)));
      // call API
      return get(makeOffsetLimitFromRange(missingIndexes));
    },
    [byPagination, get],
  );

  // update itemCount whenever it is nil
  useEffect(
    () => {
      if (isNil(itemCount)) {
        countSavedFilesBuilder({ identityId })
          .then((result) => dispatch(receivePaginatedItemCount(identityId, result)))
          .catch((e) => handleHttpErrors(e));
      }
    },
    [identityId, dispatch, handleHttpErrors, itemCount],
  );

  // extra memoization layer because of object format
  return useMemo(
    () => ({
      byPagination,
      itemCount,
      loadMoreItems,
    }),
    [byPagination, itemCount, loadMoreItems],
  );
};
