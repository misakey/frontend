import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { AVATAR_SIZE, AVATAR_SM_SIZE } from '@misakey/ui/constants/sizes';
import STATUSES from 'constants/app/boxes/statuses';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import makeStyles from '@material-ui/core/styles/makeStyles';
import usePaginateBoxesByStatusMissingPublicKeys from 'hooks/usePaginateBoxesByStatus/missingPublicKeys';

import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import MoreVertIcon from '@material-ui/icons/MoreVert';

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatarRoot: {
    height: AVATAR_SIZE,
    width: AVATAR_SIZE,
    backgroundColor: theme.palette.grey[400],
    color: theme.palette.background.paper,
    [theme.breakpoints.down('sm')]: {
      height: AVATAR_SM_SIZE,
      width: AVATAR_SM_SIZE,
    },
  },
  paper: {
    border: `1px solid ${theme.palette.grey[300]}`,
  },
  list: {
    padding: 0,
  },
}));

// COMPONENTS
const ListItemBoxesDeleted = ({ t, activeStatus, search, ...props }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState(null);

  const [
    missingPublicKeys,
    emptyCount,
    clearMissingSecrets,
  ] = usePaginateBoxesByStatusMissingPublicKeys(activeStatus, search);

  const missingPublicKeysCount = useMemo(
    () => Math.max(missingPublicKeys.length - emptyCount, 0),
    [missingPublicKeys, emptyCount],
  );

  const onClick = useCallback(
    (event) => {
      setAnchorEl(event.currentTarget);
    },
    [setAnchorEl],
  );

  const onClose = useCallback(
    () => {
      setAnchorEl(null);
    },
    [setAnchorEl],
  );

  const onDelete = useCallback(
    () => clearMissingSecrets().then(onClose),
    [clearMissingSecrets, onClose],
  );

  if (missingPublicKeysCount === 0) {
    return null;
  }

  return (
    <ListItem {...omitTranslationProps(props)}>
      <ListItemAvatar>
        <Avatar classes={{ root: classes.avatarRoot }}>
          <DeleteSweepIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={t('boxes:list.deleted.count.text', { count: missingPublicKeysCount })}
        secondary={t('boxes:list.deleted.subtitle.text', { count: missingPublicKeysCount })}
        primaryTypographyProps={{ noWrap: true }}
        secondaryTypographyProps={{ noWrap: true }}
      />
      <Menu
        id="boxes-deleted-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        classes={{ paper: classes.paper, list: classes.list }}
        elevation={0}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={onDelete}>{t('common:leave')}</MenuItem>
      </Menu>
      <ListItemSecondaryAction>
        <IconButton onClick={onClick} aria-label={t('common:more')} aria-controls="boxes-deleted-menu" aria-haspopup="true">
          <MoreVertIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

ListItemBoxesDeleted.propTypes = {
  activeStatus: PropTypes.oneOf(STATUSES).isRequired,
  search: PropTypes.string,
  // withTranslation
  t: PropTypes.func.isRequired,
};

ListItemBoxesDeleted.defaultProps = {
  search: null,
};

export default withTranslation(['common', 'boxes'])(ListItemBoxesDeleted);
