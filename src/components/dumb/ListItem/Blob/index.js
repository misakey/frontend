import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { UPLOAD } from 'constants/upload/status';
import isNil from '@misakey/helpers/isNil';
import formatFileSize from 'helpers/formatFileSize';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import IconProgress from '@misakey/ui/Icon/Progress';
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
import LinearProgress from '@material-ui/core/LinearProgress';

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: {
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: '5px',
    margin: theme.spacing(1, 0),
  },
  progress: {
    marginTop: -12,
    borderRadius: '0 0 5px 5px',
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

// COMPONENTS
const BlobListItem = ({ blob, onRemove, uploadStatus, t }) => {
  const classes = useStyles();
  const { name, lastModified, size } = useMemo(() => blob, [blob]);
  const formattedSize = useMemo(
    () => formatFileSize(size), [size],
  );
  const [anchorEl, setAnchorEl] = useState(null);

  const { type, progress } = useSafeDestr(uploadStatus);

  const isEncrypted = useMemo(
    () => type === UPLOAD,
    [type],
  );

  const onClick = useCallback(
    (event) => { setAnchorEl(event.currentTarget); }, [],
  );

  const onClose = useCallback(
    () => { setAnchorEl(null); }, [],
  );

  return (
    <>
      <ListItem className={classes.root}>
        <ListItemAvatar>
          <Avatar className={classes.avatar}>
            <IconProgress
              isLoading={!isNil(uploadStatus)}
              Icon={LockOpenIcon}
              DoneIcon={LockIcon}
              done={isEncrypted}
            />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={name}
          secondary={formattedSize}
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
      {type === UPLOAD ? (
        <LinearProgress
          className={classes.progress}
          variant="determinate"
          value={isNil(progress) ? undefined : progress}
          color="secondary"
        />
      ) : null}
    </>
  );
};

BlobListItem.propTypes = {
  blob: PropTypes.object.isRequired,
  onRemove: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  uploadStatus: PropTypes.object,
};

BlobListItem.defaultProps = {
  uploadStatus: undefined,
};


export default withTranslation(['common'])(BlobListItem);
