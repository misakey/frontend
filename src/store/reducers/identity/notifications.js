import { createSelector } from 'reselect';
import { denormalize } from 'normalizr';
import createResetOnSignOutReducer from '@misakey/react/auth/store/reducers/helpers/createResetOnSignOutReducer';
import pluck from '@misakey/core/helpers/pluck';
import filter from '@misakey/core/helpers/filter';
import range from '@misakey/core/helpers/range';
import mapKeys from '@misakey/core/helpers/mapKeys';
import isNil from '@misakey/core/helpers/isNil';

import {
  SET_PAGINATION_NOTIFICATIONS_BY_IDENTITY,
  SET_NEW_NOTIFICATIONS_COUNT_BY_IDENTITY,
  SET_LAST_NOTIFICATION_BY_IDENTITY,
  DECREMENT_NEW_NOTIFICATIONS_COUNT_BY_IDENTITY,
  RESET_NOTIFICATIONS_BY_IDENTITY,
  ADD_NOTIFICATION_ID_BY_IDENTITY,
} from 'store/actions/identity/notifications';

import IdentityNotificationsSchema from 'store/schemas/Notifications/Identity';

// CONSTANTS
const REDUCER_KEY = 'notificationsByIdentity';

// HELPERS
const safeDecrement = (target, amount) => {
  const result = (target || 0) - amount;
  return result < 0 ? 0 : result;
};
const getIds = pluck('id');

// SELECTORS
export const makeGetUserNotificationsNotAckSelector = () => createSelector(
  (state) => state.entities,
  (_, ids) => ids,
  (entities, ids) => {
    const notifications = denormalize(ids, IdentityNotificationsSchema.collection, entities);
    const notificationsToAck = filter(notifications, ['acknowledgedAt', null]);
    return getIds(notificationsToAck);
  },
);

export const getNewCountSelector = createSelector(
  (state) => state[REDUCER_KEY],
  (items) => items.newCount,
);
export const getLastNotificationSelector = createSelector(
  (state) => state[REDUCER_KEY],
  (state) => state.entities,
  (items, entities) => (isNil(items.lastNotification)
    ? items.lastNotification
    : denormalize(items.lastNotification, IdentityNotificationsSchema.entity, entities)
  ),
);

export const getPaginationSelector = createSelector(
  (state) => state[REDUCER_KEY],
  (items) => ({ hasNextPage: items.hasNextPage, items: items.notifications }),
);

const initialState = {
  notifications: null,
  newCount: null,
  lastNotification: undefined,
  hasNextPage: false,
};

const setPaginationNotifications = (state, { newNotifications, hasNextPage }) => {
  const oldItems = state.notifications || {};
  const numberOfNew = newNotifications.length;
  const paginatedRange = range(0, numberOfNew);
  const nextItems = paginatedRange.reduce((aggr, key, index) => ({
    ...aggr,
    [key + Object.keys(oldItems).length]: newNotifications[index],
  }), {});

  return {
    ...state,
    hasNextPage,
    notifications: {
      ...oldItems,
      ...nextItems,
    },
  };
};

const addPaginatedNotificationId = (state, { newNotificationId }) => {
  const { notifications, newCount } = state;
  if (isNil(notifications)) {
    return {
      ...state,
      newCount: isNil(newCount) ? newCount : newCount + 1,
      lastNotification: newNotificationId,
    };
  }

  const currentItems = state.notifications || {};

  return {
    ...state,
    newCount: state.newCount + 1,
    lastNotification: newNotificationId,
    notifications: {
      0: newNotificationId,
      ...mapKeys(currentItems, (_, key) => parseInt(key, 10) + 1),
    },
  };
};

const setNewCount = (state, { newCount }) => ({ ...state, newCount });

const decrementNewCount = (state, { decrement }) => ({
  ...state,
  newCount: safeDecrement(state.newCount, decrement),
});

const setLastNotification = (state, { lastNotification }) => ({ ...state, lastNotification });

const resetNotifications = () => initialState;

export default {
  [REDUCER_KEY]: createResetOnSignOutReducer(initialState, {
    [SET_PAGINATION_NOTIFICATIONS_BY_IDENTITY]: setPaginationNotifications,
    [SET_NEW_NOTIFICATIONS_COUNT_BY_IDENTITY]: setNewCount,
    [SET_LAST_NOTIFICATION_BY_IDENTITY]: setLastNotification,
    [DECREMENT_NEW_NOTIFICATIONS_COUNT_BY_IDENTITY]: decrementNewCount,
    [RESET_NOTIFICATIONS_BY_IDENTITY]: resetNotifications,
    [ADD_NOTIFICATION_ID_BY_IDENTITY]: addPaginatedNotificationId,
  }),
};
