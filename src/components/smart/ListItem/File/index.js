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
import withDialogPassword from 'components/smart/Dialog/Password/with';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

import isNil from '@misakey/helpers/isNil';
import formatFileSize from 'helpers/formatFileSize';
import isFunction from '@misakey/helpers/isFunction';

import useGetFileIconFromType from 'hooks/useGetFileIconFromType';
import useCalendarDateSince from '@misakey/hooks/useCalendarDateSince';
import FILE_PROP_TYPES from '@misakey/ui/constants/file/proptypes';
import isElementFocusedByEvent from '@misakey/helpers/isElementFocusedByEvent';

const AVATAR_SIZE = '5rem';
const ButtonWithDialogPassword = withDialogPassword(Button);

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
    isSaved,
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
            {!isNil(onSave) && (
              <ButtonWithDialogPassword
                ref={buttonRef}
                size="small"
                color="primary"
                classes={{ root: classes.button }}
                onClick={onSave}
                disabled={!isNil(error) || isSaved}
                startIcon={isSaved ? <CheckCircleIcon color="primary" /> : null}
              >
                {isSaved ? t('common:savedInVault') : t('common:addToVault')}
              </ButtonWithDialogPassword>
            )}
          </>
        )}
      />
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
              {actions.map(({ text, key, component: Component = MenuItem, ...props }) => (
                <Component key={key} {...props}>{text}</Component>
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
