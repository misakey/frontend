import { useMemo, useCallback, useState } from 'react';
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
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import LinearProgress from '@material-ui/core/LinearProgress';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import LockIcon from '@material-ui/icons/Lock';
import CancelIcon from '@material-ui/icons/Cancel';

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

  const { type, progress, req } = useSafeDestr(uploadStatus);

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

  const onAbort = useCallback(
    () => {
      req.abort();
    },
    [req],
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
          <>
            {isEncrypted ? (
              <IconButton disabled={isNil(req)} onClick={onAbort} edge="end" aria-label={t('common:cancel')}>
                <CancelIcon />
              </IconButton>
            ) : (
              <IconButton onClick={onClick} disabled={!isNil(type)} edge="end" aria-label={t('common:more')}>
                <MoreVertIcon />
              </IconButton>

            )}
            <Menu
              id={`menu-remove-blob-${lastModified}`}
              anchorEl={anchorEl}
              keepMounted
              open={!isNil((anchorEl))}
              onClose={onClose}
              variant="menu"
              MenuListProps={{ disablePadding: true }}
              PaperProps={{ variant: 'outlined' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={onRemove}>{t('common:delete')}</MenuItem>
            </Menu>
          </>
        </ListItemSecondaryAction>
      </ListItem>
      {isEncrypted ? (
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
