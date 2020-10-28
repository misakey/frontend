import React, { useMemo, useCallback, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation, Trans } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles/';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import Button from '@material-ui/core/Button';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import Skeleton from '@material-ui/lab/Skeleton';
import Box from '@material-ui/core/Box';
import MenuItem from '@material-ui/core/MenuItem';

import isNil from '@misakey/helpers/isNil';
import formatFileSize from 'helpers/formatFileSize';
import isFunction from '@misakey/helpers/isFunction';

import useGetFileIconFromType from 'hooks/useGetFileIconFromType';
import useCalendarDateSince from '@misakey/hooks/useCalendarDateSince';
import FILE_PROP_TYPES from 'constants/file/proptypes';
import isElementFocusedByEvent from '@misakey/helpers/isElementFocusedByEvent';

const AVATAR_SIZE = '5rem';

// HOOKS
const useStyles = makeStyles((theme) => ({
  paper: {
    border: `1px solid ${theme.palette.grey[300]}`,
  },
  list: {
    padding: 0,
  },
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

const FileListItem = ({ file, actions, onClick, onSave, ...rest }) => {
  const classes = useStyles();
  const { t } = useTranslation('common');

  const [anchorEl, setAnchorEl] = useState(null);
  const buttonRef = useRef();

  const {
    size,
    blobUrl,
    name,
    type,
    createdAt,
    error,
    isLoading,
    sender: { displayName, isFromCurrentUser } = {},
  } = useMemo(() => file, [file]);

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
          <Trans i18nKey="components:fileListItem.addedBy" values={{ date: dateSince }}>
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

  const onMenuClick = useCallback(
    (event) => { setAnchorEl(event.currentTarget); }, [],
  );

  const onItemClick = useCallback(
    (e) => {
      if (!isFunction(onClick)) { return; }
      if (isElementFocusedByEvent(e, buttonRef.current)) {
        e.preventDefault(); e.stopPropagation(); return;
      }
      onClick();
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
      onClick={onItemClick}
      disableTouchRipple
      ContainerComponent={Box}
      ContainerProps={{ ...rest }}
      divider
    >
      <ListItemAvatar>
        <Avatar variant="rounded" className={classes.avatar} src={blobUrl}>
          {isLoading
            ? <HourglassEmptyIcon className={classes.icons} />
            : <FileIcon fontSize="large" />}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
          primary={name || t('common:undecryptable')}
          secondary={(
            <>
              <Typography component="span" noWrap display="block" variant="caption">{secondary}</Typography>
              <Typography component="span" noWrap display="block" variant="caption">{tertiary}</Typography>
              {!isNil(onSave) && (
              <Button
                ref={buttonRef}
                size="small"
                color="secondary"
                className={classes.button}
                onClick={onSave}
                disabled={!isNil(error)}
              >
                {t('common:addToVault')}
              </Button>
              )}
            </>
        )}
          primaryTypographyProps={{ noWrap: true, display: 'block', color: 'textPrimary' }}
      />
      {
        !isNil(actions) && (
          <ListItemSecondaryAction>
            <IconButton onClick={onMenuClick} edge="end" aria-label="menu-more">
              <MoreVertIcon />
            </IconButton>
            <Menu
              id={`menu-delete-file-${createdAt}`}
              anchorEl={anchorEl}
              keepMounted
              open={!isNil((anchorEl))}
              onClose={onClose}
              onClick={onClose}
              classes={{ paper: classes.paper, list: classes.list }}
              elevation={0}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {actions.map(({ text, component: Component = MenuItem, ...props }) => (
                <Component {...props}>{text}</Component>
              ))}
            </Menu>
          </ListItemSecondaryAction>
        )
      }
    </ListItem>
  );
};

FileListItem.propTypes = {
  file: PropTypes.shape(FILE_PROP_TYPES).isRequired,
  onSave: PropTypes.func,
  actions: PropTypes.arrayOf(PropTypes.object),
  onClick: PropTypes.func,
};

FileListItem.defaultProps = {
  onSave: null,
  actions: null,
  onClick: null,
};


export default FileListItem;
