import React, { forwardRef, useMemo } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { useSetPasswordContext } from '@misakey/react/auth/components/Dialog/Password/Create/Context';

import ContextMenuItem from '@misakey/ui/Menu/ContextMenu/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import RemoveFromVaultIcon from '@misakey/ui/Icon/RemoveFromVault';

// COMPONENTS
const MenuItemRemoveFileFromVault = forwardRef(({
  t, onRemove, isSaved, disabled, component: Component,
}, ref) => {
  const { withPasswordOnClick } = useSetPasswordContext();
  const onClick = useMemo(() => withPasswordOnClick(onRemove), [onRemove, withPasswordOnClick]);

  return (
    <Component ref={ref} onClick={onClick} disabled={disabled || isSaved}>
      <ListItemIcon>
        <RemoveFromVaultIcon />
      </ListItemIcon>
      <ListItemText primary={t('common:remove')} />
    </Component>
  );
});

MenuItemRemoveFileFromVault.propTypes = {
  component: PropTypes.elementType,
  // withTranslation
  t: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  isSaved: PropTypes.bool,
};

MenuItemRemoveFileFromVault.defaultProps = {
  component: ContextMenuItem,
  disabled: false,
  isSaved: false,
};

export default withTranslation('common', { withRef: true })(MenuItemRemoveFileFromVault);
