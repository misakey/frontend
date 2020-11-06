import React, { forwardRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import isFunction from '@misakey/helpers/isFunction';

import BoxesSchema from 'store/schemas/Boxes';
import useUpdateBoxSettings from 'hooks/useUpdateBoxSettings';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import MenuItem from '@material-ui/core/MenuItem';

const DEFAULT_SETTINGS = { muted: false };

// COMPONENTS
const MenuItemBoxMute = forwardRef(({ box, onClose }, ref) => {
  const { t } = useTranslation('boxes');

  const { settings: { muted } = DEFAULT_SETTINGS, id: boxId } = useSafeDestr(box);
  const { wrappedFetch: onUpdateBoxSettings } = useUpdateBoxSettings(boxId, !muted);

  const onClick = useCallback(
    () => {
      onUpdateBoxSettings();
      if (isFunction(onClose)) {
        onClose();
      }
    },
    [onUpdateBoxSettings, onClose],
  );

  return (
    <MenuItem
      ref={ref}
      onClick={onClick}
      aria-label={t('boxes:notifications.title')}
    >
      {t(`boxes:notifications.${muted ? 'unmute' : 'mute'}`)}
    </MenuItem>
  );
});

MenuItemBoxMute.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  onClose: PropTypes.func,
};

MenuItemBoxMute.defaultProps = {
  onClose: null,
};

export default MenuItemBoxMute;
