import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

import {
  ACCESS_STATUS_MEMBER, ACCESS_STATUS_NEEDS_LINK, ACCESS_STATUS_INVITED, ACCESS_STATUS_OWNER,
} from '@misakey/ui/constants/accessStatus';

import isFunction from '@misakey/helpers/isFunction';
import isNil from '@misakey/helpers/isNil';

import { useTranslation } from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';

import ListItemUser from '@misakey/ui/ListItem/User';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import Skeleton from '@material-ui/lab/Skeleton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Subtitle from '@misakey/ui/Typography/Subtitle';

import MoreVertIcon from '@material-ui/icons/MoreVert';

// CONSTANTS
// @FIXME max width must be updated if text changes
const SECONDARY_ACTION_MAX_WIDTH = 110;
const AVATAR_WIDTH = 56;

// HOOKS
const useStyles = makeStyles((theme) => ({
  listItemRoot: ({ needsLink }) => ({
    backgroundColor: needsLink ? theme.palette.action.selected : null,
  }),
  listItemText: {
    maxWidth: `calc(100% - ${SECONDARY_ACTION_MAX_WIDTH}px - ${AVATAR_WIDTH}px)`,
  },
}));

// COMPONENTS
const ListItemUserWhitelisted = ({
  onRemove,
  identifier,
  id,
  autoInvite,
  isOwner,
  isMember,
  ...rest }) => {
  const { t } = useTranslation(['components', 'common']);

  const [anchorEl, setAnchorEl] = useState(null);

  const hasOnRemove = useMemo(
    () => isFunction(onRemove),
    [onRemove],
  );

  const canRemove = useMemo(
    () => hasOnRemove && !isOwner,
    [hasOnRemove, isOwner],
  );

  const accessStatus = useMemo(
    () => {
      if (isOwner) {
        return ACCESS_STATUS_OWNER;
      }
      if (isMember) {
        return ACCESS_STATUS_MEMBER;
      }
      if (autoInvite) {
        return ACCESS_STATUS_INVITED;
      }
      return ACCESS_STATUS_NEEDS_LINK;
    },
    [isMember, isOwner, autoInvite],
  );

  const needsLink = useMemo(
    () => accessStatus === ACCESS_STATUS_NEEDS_LINK,
    [accessStatus],
  );

  const classes = useStyles({ needsLink });

  const subtitleColor = useMemo(
    () => {
      if (accessStatus === ACCESS_STATUS_MEMBER || accessStatus === ACCESS_STATUS_OWNER) {
        return 'textSecondary';
      }
      if (accessStatus === ACCESS_STATUS_NEEDS_LINK) {
        return 'primary';
      }
      if (accessStatus === ACCESS_STATUS_INVITED) {
        return 'textPrimary';
      }
      return undefined;
    },
    [accessStatus],
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

  const handleRemove = useCallback(
    (event) => {
      onClose(event);
      if (hasOnRemove) {
        onRemove(event, id);
      }
    },
    [onClose, hasOnRemove, onRemove, id],
  );

  return (
    <ListItemUser
      classes={{ root: classes.listItemRoot, listItemText: classes.listItemText }}
      {...rest}
      identifier={identifier}
    >
      <Box
        component={ListItemSecondaryAction}
        display="flex"
        alignItems="center"
        maxWidth={SECONDARY_ACTION_MAX_WIDTH}
      >
        <Subtitle color={subtitleColor}>
          {isNil(accessStatus) ? <Skeleton variant="text" width={50} /> : t(`components:whitelist.${accessStatus}`)}
        </Subtitle>
        {canRemove && (
          <IconButton onClick={onClick} edge="end">
            <MoreVertIcon />
          </IconButton>
        )}
      </Box>
      {canRemove && (
        <Menu
          id="listitem-user-whitelisted-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={onClose}
        >
          <MenuItem onClick={handleRemove}>{t('common:remove')}</MenuItem>
        </Menu>
      )}
    </ListItemUser>
  );
};

ListItemUserWhitelisted.propTypes = {
  identifier: PropTypes.string,
  onRemove: PropTypes.func,
  autoInvite: PropTypes.bool,
  isMember: PropTypes.bool,
  isOwner: PropTypes.bool,
  id: PropTypes.string.isRequired,
};

ListItemUserWhitelisted.defaultProps = {
  identifier: '',
  onRemove: null,
  autoInvite: false,
  isMember: false,
  isOwner: false,
};

export default ListItemUserWhitelisted;
