import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';

import useMisakeyNotifications from 'hooks/useMisakeyNotifications';
import makeStyles from '@material-ui/core/styles/makeStyles';

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
const IconButtonNotificationsMisakey = forwardRef(({ selected, ...props }, ref) => {
  const classes = useStyles();

  const {
    newNotificationsCount,
  } = useMisakeyNotifications();

  const color = useMemo(
    () => (selected ? 'primary' : 'default'),
    [selected],
  );

  return (
    <IconButton
      ref={ref}
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
});

IconButtonNotificationsMisakey.propTypes = {
  selected: PropTypes.bool,
};

IconButtonNotificationsMisakey.defaultProps = {
  selected: false,
};

export default IconButtonNotificationsMisakey;
