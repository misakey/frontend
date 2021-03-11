import React, { forwardRef } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import ContextMenuItem from '@misakey/ui/Menu/ContextMenu/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import withDialogPassword from '@misakey/react-auth/components/Dialog/Password/with';
import AddToVaultIcon from '@misakey/ui/Icon/AddToVault';

const ContextMenuItemACR2Required = withDialogPassword(ContextMenuItem);

// COMPONENTS
const MenuItemAddFileToVault = forwardRef(({ t, onSave, isSaved, disabled }, ref) => (
  <ContextMenuItemACR2Required ref={ref} onClick={onSave} disabled={disabled || isSaved}>
    <ListItemIcon>
      <AddToVaultIcon isSaved={isSaved} />
    </ListItemIcon>
    <ListItemText primary={isSaved ? t('common:savedInVault') : t('common:addToVault')} />
  </ContextMenuItemACR2Required>
));

MenuItemAddFileToVault.propTypes = {
  // withTranslation
  t: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  isSaved: PropTypes.bool,
};

MenuItemAddFileToVault.defaultProps = {
  disabled: false,
  isSaved: false,
};

export default withTranslation('common', { withRef: true })(MenuItemAddFileToVault);
