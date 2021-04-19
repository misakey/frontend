import React, { forwardRef } from 'react';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Badge from '@material-ui/core/Badge';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';

import FolderIcon from '@material-ui/icons/Folder';

// HOOKS
const useStyles = makeStyles(() => ({
  badge: {
    bottom: 2,
  },
  removeIcon: {
    fontSize: '1rem',
  },
}));

const RemoveFromVaultIcon = forwardRef((props, ref) => {
  const classes = useStyles();

  return (
    <Badge
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      classes={{ badge: classes.badge }}
      badgeContent={<RemoveCircleIcon className={classes.removeIcon} color="primary" />}
    >
      <FolderIcon {...props} ref={ref} />
    </Badge>
  );
});

export default RemoveFromVaultIcon;
