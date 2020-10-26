import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import ContextMenuItem from '@misakey/ui/Menu/ContextMenu/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import DownloadIcon from '@material-ui/icons/GetApp';

// COMPONENTS
const MenuItemDownloadEvent = forwardRef(({ t, onDownload, disabled }, ref) => (
  <ContextMenuItem ref={ref} onClick={onDownload} disabled={disabled}>
    <ListItemIcon>
      <DownloadIcon />
    </ListItemIcon>
    <ListItemText primary={t('common:download')} />
  </ContextMenuItem>
));


MenuItemDownloadEvent.propTypes = {
  // withTranslation
  t: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

MenuItemDownloadEvent.defaultProps = {
  disabled: false,
};

export default withTranslation('common', { withRef: true })(MenuItemDownloadEvent);
