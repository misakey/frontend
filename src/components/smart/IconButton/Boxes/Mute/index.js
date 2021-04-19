import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';

import BoxesSchema from 'store/schemas/Boxes';

import { useTranslation } from 'react-i18next';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useUpdateBoxSettings from 'hooks/useUpdateBoxSettings';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import NotificationsOffIcon from '@material-ui/icons/NotificationsOff';
import NotificationsIcon from '@material-ui/icons/Notifications';

// CONSTANTS
const DEFAULT_SETTINGS = { muted: false };

// HOOKS
const useStyles = makeStyles(() => ({
  buttonLabel: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

// COMPONENTS
const IconButtonBoxesMute = forwardRef(({ box, ...rest }, ref) => {
  const { t } = useTranslation('boxes');
  const classes = useStyles();

  const { settings: { muted } = DEFAULT_SETTINGS, id: boxId } = useSafeDestr(box);
  const { wrappedFetch: onUpdateBoxSettings } = useUpdateBoxSettings(boxId, !muted);

  const label = useMemo(
    () => t(`boxes:notifications.${muted ? 'unmute' : 'mute'}`),
    [muted, t],
  );

  return (
    <Button
      ref={ref}
      variant="text"
      classes={{ label: classes.buttonLabel }}
      onClick={onUpdateBoxSettings}
      aria-label={label}
      {...rest}
    >
      {muted ? <NotificationsOffIcon color="action" /> : <NotificationsIcon color="primary" />}
      <Typography variant="caption" color="textSecondary">
        {label}
      </Typography>
    </Button>
  );
});

IconButtonBoxesMute.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
};

export default IconButtonBoxesMute;
