import React, { forwardRef } from 'react';

import { useTranslation } from 'react-i18next';

import { useDialogBoxesDeleteContext } from 'components/smart/Dialog/Boxes/Delete/Context';

import MenuItem from '@material-ui/core/MenuItem';

import DeleteIcon from '@material-ui/icons/Delete';

// COMPONENTS
const MenuItemBoxDelete = forwardRef((props, ref) => {
  const { t } = useTranslation('boxes');

  const { onOpen } = useDialogBoxesDeleteContext();

  return (
    <MenuItem
      ref={ref}
      button
      divider
      onClick={onOpen}
      aria-label={t('boxes:read.details.menu.delete.primary')}
      {...props}
    >
      <DeleteIcon />
      {t('boxes:read.details.menu.delete.primary')}
    </MenuItem>
  );
});

export default MenuItemBoxDelete;
