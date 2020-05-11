import DataboxSchema from 'store/schemas/Databox';
import { receiveEntities } from '@misakey/store/actions/entities';
import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import { actionCreators, selectors } from 'store/reducers/userRequests/pagination';
import { receiveApplications } from 'store/actions/applications';

import path from '@misakey/helpers/path';
import propOr from '@misakey/helpers/propOr';
import pickAll from '@misakey/helpers/pickAll';
import noop from '@misakey/helpers/noop';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import __ from '@misakey/helpers/__';
import min from '@misakey/helpers/min';
import range from '@misakey/helpers/range';
import { getUserRequestsBuilder, countUserRequestsBuilder } from '@misakey/helpers/builder/requests';
import { getApplicationsByIdsBuilder } from '@misakey/helpers/builder/applications';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';


import { useMemo, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { normalize } from 'normalizr';

// CONSTANTS
const EMPTY_OBJ = {};

// HELPERS
const actionCreatorsProp = propOr(EMPTY_OBJ, __, actionCreators);
const selectorsProp = propOr(EMPTY_OBJ, __, selectors);

const makeRangeFromOffsetLimit = ({ offset, limit }) => range(offset, offset + limit);
const makeOffsetLimitFromRange = (rangeList) => {
  const offset = min(rangeList);
  const limit = rangeList.length;
  return {
    offset,
    limit,
  };
};

const getReceiveItemCountActionCreator = (status) => {
  const statusActionCreators = actionCreatorsProp(status);
  return statusActionCreators.receivePaginatedItemCount || noop;
};

const getReceiveActionCreator = (status) => {
  const statusActionCreators = actionCreatorsProp(status);
  return statusActionCreators.receivePaginatedIds || noop;
};

const getMissingIndexes = (paginatedMap) => Object.entries(paginatedMap)
  .reduce((acc, [key, value]) => {
    if (isNil(value)) {
      acc.push(key);
    }
    return acc;
  }, []);

const applicationsByIdSelector = path(['entities', 'applicationsById']);

// HOOKS
/**
 * @param {String} status one of possible databox statuses
 * @see src/constants/databox/status.js
 * @returns {{byPagination: Object, itemCount: Number, loadMoreItems: Function}}
 * where:
 * - byPagination is a map of paginated elements
 * - itemCount is the total number of elements
 * - loadMoreItems is a function to call to ask for more items
 */
export default (status) => {
  // payload for API
  const payload = useMemo(
    () => ({ statuses: [status] }),
    [status],
  );

  // ACTIONS
  const receiveItemCountAction = useMemo(
    () => getReceiveItemCountActionCreator(status),
    [status],
  );

  const receivePaginationAction = useMemo(
    () => getReceiveActionCreator(status),
    [status],
  );
  // ---

  const dispatch = useDispatch();

  // SELECTORS
  const statusSelectors = useMemo(
    () => selectorsProp(status),
    [status],
  );

  const byPaginationSelector = useMemo(
    () => statusSelectors.getByPagination,
    [statusSelectors.getByPagination],
  );

  const itemCountSelector = useMemo(
    () => statusSelectors.getItemCount,
    [statusSelectors.getItemCount],
  );
  // ---

  // SELECTORS hooks with memoization layer
  const byPagination = useSelector(byPaginationSelector);
  const itemCount = useSelector(itemCountSelector);
  const applicationsByIdState = useSelector(applicationsByIdSelector);
  // ---

  const dispatchReceiveRequests = useCallback(
    (data, { offset, limit }) => {
      const normalized = normalize(
        data,
        DataboxSchema.collection,
      );
      const { entities, result } = normalized;
      return Promise.all([
        dispatch(receiveEntities(entities, mergeReceiveNoEmpty)),
        dispatch(receivePaginationAction(offset, limit, result)),
      ]);
    },
    [dispatch, receivePaginationAction],
  );

  // API data fetching:
  // get requests
  // check missing applications in store
  // get applications
  const get = useCallback(
    (pagination) => getUserRequestsBuilder({ ...payload, ...pagination })
      .then((response) => dispatchReceiveRequests(response.map(objectToCamelCase), pagination))
      .then(([{ entities: { applicationsById } }]) => {
        const applicationsIds = Object.keys(applicationsById);
        const storedApplications = pickAll(applicationsIds, applicationsByIdState);
        const missingApplicationsIds = getMissingIndexes(storedApplications);
        // do not return promise so that list is loaded during this fetch
        if (!isEmpty(missingApplicationsIds)) {
          getApplicationsByIdsBuilder(missingApplicationsIds)
            .then((applications) => dispatch(receiveApplications(applications)));
        }
      }),
    [applicationsByIdState, dispatch, dispatchReceiveRequests, payload],
  );

  const getCount = useCallback(
    () => countUserRequestsBuilder(payload),
    [payload],
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
        getCount()
          .then((result) => dispatch(receiveItemCountAction(result)));
      }
    },
    [dispatch, getCount, itemCount, receiveItemCountAction],
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
