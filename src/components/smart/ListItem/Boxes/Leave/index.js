import React, { forwardRef } from 'react';

import { useTranslation } from 'react-i18next';

import { useDialogBoxesLeaveContext } from 'components/smart/Dialog/Boxes/Leave/Context';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import NoMeetingRoomIcon from '@material-ui/icons/NoMeetingRoom';

// COMPONENTS
const ListItemBoxLeave = forwardRef((props, ref) => {
  const { onOpen } = useDialogBoxesLeaveContext();
  const { t } = useTranslation('boxes');

  return (
    <ListItem
      ref={ref}
      button
      divider
      onClick={onOpen}
      aria-label={t('boxes:read.details.menu.leave.primary')}
      {...props}
    >
      <ListItemText
        primary={t('boxes:read.details.menu.leave.primary')}
        secondary={t('boxes:read.details.menu.leave.secondary')}
        primaryTypographyProps={{ noWrap: true, variant: 'overline', color: 'textSecondary' }}
        secondaryTypographyProps={{ color: 'textPrimary' }}
      />
      <NoMeetingRoomIcon color="action" />
    </ListItem>
  );
});

export default ListItemBoxLeave;
