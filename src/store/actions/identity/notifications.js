export const RESET_NOTIFICATIONS_BY_IDENTITY = Symbol('RESET_NOTIFICATIONS_BY_IDENTITY');
export const SET_PAGINATION_NOTIFICATIONS_BY_IDENTITY = Symbol('SET_PAGINATION_NOTIFICATIONS_BY_IDENTITY');
export const SET_NEW_NOTIFICATIONS_COUNT_BY_IDENTITY = Symbol('SET_NEW_NOTIFICATIONS_COUNT_BY_IDENTITY');
export const SET_LAST_NOTIFICATION_BY_IDENTITY = Symbol('SET_LAST_NOTIFICATION_BY_IDENTITY');
export const DECREMENT_NEW_NOTIFICATIONS_COUNT_BY_IDENTITY = Symbol('DECREMENT_NEW_NOTIFICATIONS_COUNT_BY_IDENTITY');


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

export const setLastNotification = (lastNotification) => ({
  type: SET_LAST_NOTIFICATION_BY_IDENTITY,
  lastNotification,
});

export const resetNotifications = () => ({
  type: RESET_NOTIFICATIONS_BY_IDENTITY,
});
