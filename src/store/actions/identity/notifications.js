import { batch } from 'react-redux';
import { normalize } from 'normalizr';
import IdentityNotificationsSchema from 'store/schemas/Notifications/Identity';
import { receiveEntities, updateEntities } from '@misakey/store/actions/entities';

export const RESET_NOTIFICATIONS_BY_IDENTITY = Symbol('RESET_NOTIFICATIONS_BY_IDENTITY');
export const SET_PAGINATION_NOTIFICATIONS_BY_IDENTITY = Symbol('SET_PAGINATION_NOTIFICATIONS_BY_IDENTITY');
export const SET_NEW_NOTIFICATIONS_COUNT_BY_IDENTITY = Symbol('SET_NEW_NOTIFICATIONS_COUNT_BY_IDENTITY');
export const SET_LAST_NOTIFICATION_BY_IDENTITY = Symbol('SET_LAST_NOTIFICATION_BY_IDENTITY');
export const DECREMENT_NEW_NOTIFICATIONS_COUNT_BY_IDENTITY = Symbol('DECREMENT_NEW_NOTIFICATIONS_COUNT_BY_IDENTITY');
export const ADD_NOTIFICATION_ID_BY_IDENTITY = Symbol('ADD_NOTIFICATION_ID_BY_IDENTITY');

export const setPaginationNotifications = ({ newNotifications, hasNextPage }) => ({
  type: SET_PAGINATION_NOTIFICATIONS_BY_IDENTITY,
  newNotifications,
  hasNextPage,
});

export const setNewCount = (newCount) => ({
  type: SET_NEW_NOTIFICATIONS_COUNT_BY_IDENTITY,
  newCount,
});

export const decrementNewCount = (decrement) => ({
  type: DECREMENT_NEW_NOTIFICATIONS_COUNT_BY_IDENTITY,
  decrement,
});

export const setLastNotificationId = (lastNotification) => ({
  type: SET_LAST_NOTIFICATION_BY_IDENTITY,
  lastNotification,
});

export const resetNotifications = () => ({
  type: RESET_NOTIFICATIONS_BY_IDENTITY,
});

export const addPaginatedNotificationId = (newNotificationId) => ({
  type: ADD_NOTIFICATION_ID_BY_IDENTITY,
  newNotificationId,
});

export const addNewNotification = (newNotification) => (dispatch) => {
  const normalized = normalize(
    newNotification,
    IdentityNotificationsSchema.entity,
  );
  const { entities, result } = normalized;

  return batch(() => {
    dispatch(receiveEntities(entities));
    dispatch(addPaginatedNotificationId(result));
  });
};

export const markNotificationAsUsed = (notificationId) => updateEntities(
  [{ id: notificationId, changes: { details: { used: true } } }],
  IdentityNotificationsSchema,
);

export const setLastNotification = (notification) => (dispatch) => {
  const normalized = normalize(
    notification,
    IdentityNotificationsSchema.entity,
  );
  const { entities, result } = normalized;

  return batch(() => {
    dispatch(receiveEntities(entities));
    dispatch(setLastNotificationId(result));
  });
};
