import React, { useMemo } from 'react';

import { Link } from 'react-router-dom';

import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';
import { SUPPORTED_TYPES } from 'constants/app/notifications/byIdentity';

import { useSelector } from 'react-redux';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useTranslation } from 'react-i18next';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useMisakeyNotifications from 'hooks/useMisakeyNotifications';

import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Badge from '@misakey/ui/Badge';
import AvatarMisakey from '@misakey/ui/Avatar/Misakey';
import TypographyDateSince from 'components/dumb/Typography/DateSince';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

// CONSTANTS
const {
  identity: IDENTITY_SELECTOR,
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
function MisakeyNotificationsListItem(props) {
  const classes = useStyles();
  const { t } = useTranslation('boxes');

  const {
    newNotificationsCount,
    lastNotification,
    selected,
    to,
  } = useMisakeyNotifications(true);

  const identity = useSelector(IDENTITY_SELECTOR);

  const { displayName } = useSafeDestr(identity);

  const { details = {}, type = '', createdAt } = useSafeDestr(lastNotification);

  const secondary = useMemo(
    () => {
      if (SUPPORTED_TYPES.includes(type)) {
        return (
          <>
            <span className={classes.bold}>{t('boxes:notifications.byIdentity.previewDisplayName')}</span>
            {t(`boxes:notifications.byIdentity.types.${type}`, { ...details, displayName })}
          </>
        );
      }
      return t('boxes:notifications.byIdentity.subtitle');
    },
    [classes.bold, details, t, type, displayName],
  );

  return (
    <ListItem
      button
      selected={selected}
      component={Link}
      to={to}
      {...props}
    >
      <ListItemAvatar>
        <Badge badgeContent={newNotificationsCount}>
          <AvatarMisakey />
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
