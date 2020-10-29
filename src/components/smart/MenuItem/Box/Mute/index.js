import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import BoxesSchema from 'store/schemas/Boxes';
import useUpdateBoxSettings from 'hooks/useUpdateBoxSettings';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import MenuItem from '@material-ui/core/MenuItem';

const DEFAULT_SETTINGS = { muted: false };

// COMPONENTS
const MenuItemBoxMute = ({ box }) => {
  const { t } = useTranslation('boxes');

  const { settings: { muted } = DEFAULT_SETTINGS, id: boxId } = useSafeDestr(box);
  const { wrappedFetch: onUpdateBoxSettings } = useUpdateBoxSettings(boxId, !muted);

  return (
    <MenuItem
      onClick={onUpdateBoxSettings}
      aria-label={t('boxes:notifications.title')}
    >
      {t(`boxes:notifications.${muted ? 'unmute' : 'mute'}`)}
    </MenuItem>
  );
};

MenuItemBoxMute.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
};

export default MenuItemBoxMute;
