import React, { forwardRef } from 'react';

import { useTranslation } from 'react-i18next';
import { useDialogBoxesDeleteContext } from 'components/smart/Dialog/Boxes/Delete/Context';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import DeleteIcon from '@material-ui/icons/Delete';

// COMPONENTS
const ListItemBoxDelete = forwardRef((props, ref) => {
  const { onOpen } = useDialogBoxesDeleteContext();

  const { t } = useTranslation('boxes');

  return (
    <ListItem
      ref={ref}
      button
      divider
      onClick={onOpen}
      aria-label={t('boxes:read.details.menu.delete.primary')}
      {...props}
    >
      <ListItemText
        primary={t('boxes:read.details.menu.delete.primary')}
        secondary={t('boxes:read.details.menu.delete.secondary')}
        primaryTypographyProps={{ noWrap: true, variant: 'overline', color: 'textSecondary' }}
        secondaryTypographyProps={{ color: 'textPrimary' }}
      />
      <DeleteIcon color="action" />
    </ListItem>
  );
});

export default ListItemBoxDelete;
