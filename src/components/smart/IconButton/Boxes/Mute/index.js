import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';

import BoxesSchema from 'store/schemas/Boxes';

import { useTranslation } from 'react-i18next';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useUpdateBoxSettings from 'hooks/useUpdateBoxSettings';

import ButtonShortcut from '@misakey/ui/Button/Shortcut';

import NotificationsOffIcon from '@material-ui/icons/NotificationsOff';
import NotificationsIcon from '@material-ui/icons/Notifications';

// CONSTANTS
const DEFAULT_SETTINGS = { muted: false };

// COMPONENTS
const IconButtonBoxesMute = forwardRef(({ box, ...rest }, ref) => {
  const { t } = useTranslation('boxes');

  const { settings: { muted } = DEFAULT_SETTINGS, id: boxId } = useSafeDestr(box);
  const { wrappedFetch: onUpdateBoxSettings } = useUpdateBoxSettings(boxId, !muted);

  const label = useMemo(
    () => t(`boxes:notifications.${muted ? 'unmute' : 'mute'}`),
    [muted, t],
  );

  return (
    <ButtonShortcut
      ref={ref}
      onClick={onUpdateBoxSettings}
      label={label}
      {...rest}
    >
      {muted ? <NotificationsOffIcon color="action" /> : <NotificationsIcon color="primary" />}
    </ButtonShortcut>
  );
});

IconButtonBoxesMute.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
};

export default IconButtonBoxesMute;
