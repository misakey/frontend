import React, { useMemo, useCallback, useState } from 'react';

import PropTypes from 'prop-types';
import { useTranslation, Trans } from 'react-i18next';

import FILE_PROP_TYPES from '@misakey/ui/constants/file/proptypes';

import isNil from '@misakey/core/helpers/isNil';
import formatFileSize from '@misakey/ui/helpers/formatFileSize';
import isFunction from '@misakey/core/helpers/isFunction';
import { makeStyles } from '@material-ui/core/styles/';

import useGetFileIconFromType from 'hooks/useGetFileIconFromType';
import useCalendarDateSince from '@misakey/hooks/useCalendarDateSince';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useContextMenuAnchorEl from '@misakey/hooks/useContextMenuAnchor/el';

import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Menu from '@material-ui/core/Menu';
import Skeleton from '@material-ui/lab/Skeleton';
import Box from '@material-ui/core/Box';

import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import AddToVaultIcon from '@misakey/ui/Icon/AddToVault';

// CONSTANTS
const AVATAR_SIZE = '5rem';

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatar: {
    backgroundColor: theme.palette.grey[400],
    color: theme.palette.background.paper,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    marginRight: theme.spacing(2),
  },
  button: {
    width: 'auto',
    padding: 0,
    whiteSpace: 'nowrap',
  },
}));


export const FileListItemSkeleton = (props) => (
  <ListItem {...props}>
    <ListItemAvatar>
      <Skeleton index={0} variant="rect" component={Box} m={1} width={AVATAR_SIZE} height={AVATAR_SIZE} />
    </ListItemAvatar>
    <ListItemText
      primary={(
        <Skeleton
          component="span"
          variant="text"
          width="80%"
        />
      )}
      secondary={(
        <>
          <Skeleton
            component="span"
            variant="text"
            width="80%"
          />
          <Skeleton
            component="span"
            variant="text"
            width="80%"
          />
          <Skeleton
            component="span"
            variant="text"
            width="80%"
          />
        </>
      )}
    />
  </ListItem>
);

const FileListItem = ({ file, actions, onClick, ...rest }) => {
  const classes = useStyles();
  const { t } = useTranslation('common');

  const [anchorEl, setAnchorEl] = useState(null);

  const {
    size,
    blobUrl,
    name,
    type,
    createdAt,
    error,
    isLoading,
    isSaved,
    sender: { displayName, isFromCurrentUser } = {},
  } = useSafeDestr(file);

  const formattedSize = useMemo(
    () => (isNil(size) ? null : formatFileSize(size)), [size],
  );

  const dateSince = useCalendarDateSince(createdAt);

  const secondary = useMemo(
    () => (isNil(formattedSize) || isNil(type) ? '-' : `${type} (${formattedSize})`),
    [formattedSize, type],
  );

  const tertiary = useMemo(
    () => {
      if (!isNil(dateSince) && (!isNil(displayName) || isFromCurrentUser)) {
        return (
          <Trans
            i18nKey={`components:fileListItem.addedBy.${isFromCurrentUser ? 'you' : 'they'}`}
            values={{ date: dateSince, displayName }}
          >
            Added by
            <strong>You</strong>
            {dateSince}
          </Trans>
        );
      }
      return '-';
    },
    [dateSince, displayName, isFromCurrentUser],
  );

  const { onContextMenu } = useContextMenuAnchorEl({ onAnchor: setAnchorEl });

  const onMenuClick = useCallback(
    (event) => { setAnchorEl(event.currentTarget); }, [],
  );

  const onItemClick = useCallback(
    (e) => {
      if (!isFunction(onClick)) { return; }
      onClick(e);
    },
    [onClick],
  );

  const onClose = useCallback(
    () => { setAnchorEl(null); }, [],
  );

  const FileIcon = useGetFileIconFromType(type, !isNil(error));

  return (
    <ListItem
      button={!isNil(onClick)}
      disabled={!isNil(error)}
      onContextMenu={onContextMenu}
      onClick={onItemClick}
      disableTouchRipple
      ContainerComponent={Box}
      ContainerProps={{ ...rest }}
      divider
    >
      <ListItemAvatar>
        <Avatar variant="rounded" className={classes.avatar} src={blobUrl}>
          {isLoading
            ? <HourglassEmptyIcon />
            : <FileIcon fontSize="large" />}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={name || t('common:undecryptable')}
        primaryTypographyProps={{ noWrap: true, display: 'block', color: 'textPrimary' }}
        secondary={(
          <>
            <Typography component="span" noWrap display="block" variant="caption">{secondary}</Typography>
            <Typography component="span" noWrap display="block" variant="caption">{tertiary}</Typography>
          </>
        )}
      />
      {isSaved && (
        <AddToVaultIcon color="action" isSaved />
      )}
      {
        !isNil(actions) && (
          <ListItemSecondaryAction>
            <IconButton
              onClick={onMenuClick}
              edge="end"
              aria-label="menu-more"
            >
              <MoreVertIcon />
            </IconButton>
            <Menu
              id={`menu-delete-file-${createdAt}`}
              anchorEl={anchorEl}
              keepMounted
              open={!isNil((anchorEl))}
              onClose={onClose}
              onClick={onClose}
              variant="menu"
              MenuListProps={{ disablePadding: true }}
              PaperProps={{ variant: 'outlined' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {actions}
            </Menu>
          </ListItemSecondaryAction>
        )
      }
    </ListItem>
  );
};

FileListItem.propTypes = {
  file: PropTypes.shape(FILE_PROP_TYPES).isRequired,
  actions: PropTypes.node,
  onClick: PropTypes.func,
};

FileListItem.defaultProps = {
  actions: null,
  onClick: null,
};


export default FileListItem;
