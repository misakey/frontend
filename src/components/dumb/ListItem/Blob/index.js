import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import numbro from 'numbro';
import { FILE_SIZE_FORMAT } from 'constants/formats/numbers';

import { makeStyles } from '@material-ui/core/styles/';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import LockIcon from '@material-ui/icons/Lock';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import isNil from '@misakey/helpers/isNil';

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: {
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: '5px',
    margin: theme.spacing(1, 0),
  },
  paper: {
    border: `1px solid ${theme.palette.grey[300]}`,
  },
  list: {
    padding: 0,
  },
  avatar: {
    backgroundColor: 'unset',
    color: theme.palette.primary.main,
  },
}));


const BlobListItem = ({ blob, onRemove, isEncrypted, t }) => {
  const classes = useStyles();
  const { name, lastModified } = useMemo(() => blob, [blob]);
  const size = useMemo(() => numbro(blob.size).format(FILE_SIZE_FORMAT), [blob.size]);
  const [anchorEl, setAnchorEl] = useState(null);

  const onClick = useCallback(
    (event) => { setAnchorEl(event.currentTarget); }, [],
  );

  const onClose = useCallback(
    () => { setAnchorEl(null); }, [],
  );

  return (
    <ListItem className={classes.root}>
      <ListItemAvatar>
        <Avatar className={classes.avatar}>
          {isEncrypted ? <LockIcon /> : <LockOpenIcon />}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={name}
        secondary={size}
        primaryTypographyProps={{ noWrap: true, display: 'block' }}
        secondaryTypographyProps={{ noWrap: true, display: 'block' }}
      />
      <ListItemSecondaryAction>
        <IconButton onClick={onClick} edge="end" aria-label="menu-more">
          <MoreVertIcon />
        </IconButton>
        <Menu
          id={`menu-remove-blob-${lastModified}`}
          anchorEl={anchorEl}
          keepMounted
          open={!isNil((anchorEl))}
          onClose={onClose}
          classes={{ paper: classes.paper, list: classes.list }}
          elevation={0}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={onRemove}>{t('common:delete')}</MenuItem>
        </Menu>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

BlobListItem.propTypes = {
  blob: PropTypes.object.isRequired,
  onRemove: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  isEncrypted: PropTypes.bool,
};

BlobListItem.defaultProps = {
  isEncrypted: false,
};


export default withTranslation(['common'])(BlobListItem);
