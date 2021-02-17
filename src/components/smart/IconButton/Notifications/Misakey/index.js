import React, { useMemo } from 'react';

import useMisakeyNotifications from 'hooks/useMisakeyNotifications';
import makeStyles from '@material-ui/core/styles/makeStyles';

import { Link } from 'react-router-dom';
import IconButton from '@material-ui/core/IconButton';
import Badge from '@misakey/ui/Badge';

import NotificationsIcon from '@material-ui/icons/Notifications';

// HOOKS
const useStyles = makeStyles(() => ({
  badge: {
    top: 'auto',
  },
}));

// COMPONENTS
const IconButtonNotificationsMisakey = (props) => {
  const classes = useStyles();

  const {
    newNotificationsCount,
    selected,
    to,
  } = useMisakeyNotifications();

  const color = useMemo(
    () => (selected ? 'primary' : 'default'),
    [selected],
  );

  return (
    <IconButton
      component={Link}
      to={to}
      color={color}
      {...props}
    >
      <Badge
        classes={{ badge: classes.badge }}
        badgeContent={newNotificationsCount}
      >
        <NotificationsIcon />
      </Badge>
    </IconButton>
  );
};

export default IconButtonNotificationsMisakey;
