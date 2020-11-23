import React, { useMemo, useCallback } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import routes from 'routes';
import { useSelector, useDispatch } from 'react-redux';

import makeStyles from '@material-ui/core/styles/makeStyles';

import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Badge from '@misakey/ui/Badge';
import Avatar from '@material-ui/core/Avatar';
import TypographyDateSince from 'components/dumb/Typography/DateSince';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import isNil from '@misakey/helpers/isNil';
import head from '@misakey/helpers/head';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import { countUserNotificationsBuilder, getUserNotificationsBuilder } from '@misakey/helpers/builder/identities';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';
import { SUPPORTED_TYPES } from 'constants/app/notifications/byIdentity';
import { setNewCount, setLastNotification } from 'store/actions/identity/notifications';
import { getLastNotificationSelector, getNewCountSelector } from 'store/reducers/identity/notifications';

const {
  identityId: IDENTITY_ID_SELECTOR,
  isAuthenticated: IS_AUTHENTICATED_SELECTOR,
} = authSelectors;

// HOOKS
const useStyles = makeStyles(() => ({
  listItemText: {
    // Needed for IE11
    width: '100%',
  },
  bold: {
    fontWeight: 800,
  },
}));

// COMPONENTS
function MisakeyNotificationsListItem({ ...props }) {
  const classes = useStyles();
  const { t } = useTranslation('boxes');

  const dispatch = useDispatch();
  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);
  const identityId = useSelector(IDENTITY_ID_SELECTOR);
  const newNotificationsCount = useSelector(getNewCountSelector);
  const lastNotification = useSelector(getLastNotificationSelector);

  const matchNotificationsRoute = useRouteMatch(routes.userNotifications._);

  const selected = useMemo(() => !isNil(matchNotificationsRoute), [matchNotificationsRoute]);
  const { details = {}, type = '', createdAt } = useMemo(
    () => lastNotification || {},
    [lastNotification],
  );

  const secondary = useMemo(
    () => {
      if (SUPPORTED_TYPES.includes(type)) {
        return (
          <>
            <span className={classes.bold}>{t('boxes:notifications.byIdentity.previewDisplayName')}</span>
            {t(`boxes:notifications.byIdentity.types.${type}`, { ...details })}
          </>
        );
      }
      return t('boxes:notifications.byIdentity.subtitle');
    },
    [classes.bold, details, t, type],
  );

  const shouldFetch = useMemo(
    () => isNil(lastNotification) && isAuthenticated,
    [lastNotification, isAuthenticated],
  );

  const shouldFetchCount = useMemo(
    () => isNil(newNotificationsCount) && isAuthenticated,
    [newNotificationsCount, isAuthenticated],
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

  return (
    <ListItem
      button
      selected={selected}
      component={Link}
      to={routes.userNotifications._}
      {...props}
    >
      <ListItemAvatar>
        <Badge badgeContent={newNotificationsCount}>
          <Avatar src="/img/logo.png" />
        </Badge>
      </ListItemAvatar>
      <ListItemText
        className={classes.listItemText}
        primary={(
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography noWrap>{t('boxes:notifications.byIdentity.title')}</Typography>
            <TypographyDateSince date={createdAt} />
          </Box>
        )}
        secondary={secondary}
        primaryTypographyProps={{ noWrap: true, display: 'block' }}
        secondaryTypographyProps={{ noWrap: true, display: 'block' }}
      />
    </ListItem>
  );
}

export default MisakeyNotificationsListItem;
