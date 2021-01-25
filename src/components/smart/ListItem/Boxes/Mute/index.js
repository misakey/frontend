import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import BoxesSchema from 'store/schemas/Boxes';
import useUpdateBoxSettings from 'hooks/useUpdateBoxSettings';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import NotificationsOffIcon from '@material-ui/icons/NotificationsOff';
import NotificationsIcon from '@material-ui/icons/Notifications';

const DEFAULT_SETTINGS = { muted: false };

// COMPONENTS
const ListItemBoxMute = ({ box }) => {
  const { t } = useTranslation('boxes');

  const { settings: { muted } = DEFAULT_SETTINGS, id: boxId } = useSafeDestr(box);
  const { wrappedFetch: onUpdateBoxSettings } = useUpdateBoxSettings(boxId, !muted);

  return (
    <ListItem
      button
      divider
      onClick={onUpdateBoxSettings}
      aria-label={t('boxes:notifications.title')}
    >
      <ListItemText
        primary={t('boxes:notifications.title')}
        secondary={t(`boxes:notifications.${muted ? 'unmute' : 'mute'}`)}
        primaryTypographyProps={{ noWrap: true, variant: 'overline', color: 'textSecondary' }}
        secondaryTypographyProps={{ color: 'textPrimary' }}

      />
      {muted ? <NotificationsOffIcon color="disabled" /> : <NotificationsIcon color="primary" />}
    </ListItem>
  );
};

ListItemBoxMute.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
};

export default ListItemBoxMute;
