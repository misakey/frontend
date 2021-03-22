import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';
import { setNewCount, setLastNotification } from 'store/actions/identity/notifications';
import { getLastNotificationSelector, getNewCountSelector } from 'store/reducers/identity/notifications';

import { countUserNotificationsBuilder, getUserNotificationsBuilder } from '@misakey/helpers/builder/identities';
import isNil from '@misakey/helpers/isNil';
import head from '@misakey/helpers/head';

import { useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useFetchEffect from '@misakey/hooks/useFetch/effect';

// CONSTANTS
const {
  identityId: IDENTITY_ID_SELECTOR,
  isAuthenticated: IS_AUTHENTICATED_SELECTOR,
} = authSelectors;

// HOOKS
export default (fetchLastNotification = false) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);
  const identityId = useSelector(IDENTITY_ID_SELECTOR);
  const newNotificationsCount = useSelector(getNewCountSelector);
  const lastNotification = useSelector(getLastNotificationSelector);

  const shouldFetch = useMemo(
    () => fetchLastNotification === true && lastNotification === undefined
    && isAuthenticated && !isNil(identityId),
    [fetchLastNotification, lastNotification, isAuthenticated, identityId],
  );

  const shouldFetchCount = useMemo(
    () => isNil(newNotificationsCount) && isAuthenticated && !isNil(identityId),
    [newNotificationsCount, isAuthenticated, identityId],
  );

  const countNotifications = useCallback(
    () => countUserNotificationsBuilder(identityId),
    [identityId],
  );
  const fetchUserNotifications = useCallback(
    () => getUserNotificationsBuilder(identityId, { offset: 0, limit: 1 }),
    [identityId],
  );

  const storeNotificationsCount = useCallback(
    (response) => dispatch(setNewCount(response)),
    [dispatch],
  );

  const storeLastNotification = useCallback(
    (response) => dispatch(setLastNotification(head(response))),
    [dispatch],
  );

  useFetchEffect(
    fetchUserNotifications,
    { shouldFetch },
    { onSuccess: storeLastNotification },
  );
  useFetchEffect(
    countNotifications,
    { shouldFetch: shouldFetchCount },
    { onSuccess: storeNotificationsCount },
  );

  return useMemo(
    () => ({
      newNotificationsCount,
      lastNotification,
    }),
    [lastNotification, newNotificationsCount],
  );
};
