import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

import isFunction from '@misakey/helpers/isFunction';

import { useTranslation } from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';

import ListItemDomain from '@misakey/ui/ListItem/Domain';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Subtitle from '@misakey/ui/Typography/Subtitle';

import MoreVertIcon from '@material-ui/icons/MoreVert';

// CONSTANTS
// @FIXME max width must be updated if text changes
const SECONDARY_ACTION_MAX_WIDTH = 110;
const AVATAR_WIDTH = 56;

// HOOKS
const useStyles = makeStyles(() => ({
  listItemText: {
    maxWidth: `calc(100% - ${SECONDARY_ACTION_MAX_WIDTH}px - ${AVATAR_WIDTH}px)`,
  },
}));

// COMPONENTS
const ListItemDomainWhitelisted = ({ onRemove, id, ...rest }) => {
  const { t } = useTranslation(['components', 'common']);
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState(null);

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
      if (isFunction(onRemove)) {
        onRemove(event, id);
      }
    },
    [onClose, onRemove, id],
  );

  return (
    <ListItemDomain
      {...rest}
      displayName={t('components:whitelist.domainTitle')}
      classes={{ listItemText: classes.listItemText }}
    >
      <Box
        component={ListItemSecondaryAction}
        display="flex"
        alignItems="center"
        maxWidth={SECONDARY_ACTION_MAX_WIDTH}
      >
        <Subtitle color="secondary">{t('components:whitelist.needs_link')}</Subtitle>
        <IconButton onClick={onClick} edge="end">
          <MoreVertIcon />
        </IconButton>
      </Box>
      <Menu
        id="listitem-domain-whitelisted-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={onClose}
      >
        <MenuItem onClick={handleRemove}>{t('common:remove')}</MenuItem>
      </Menu>
    </ListItemDomain>
  );
};

ListItemDomainWhitelisted.propTypes = {
  id: PropTypes.string.isRequired,
  onRemove: PropTypes.func,
};

ListItemDomainWhitelisted.defaultProps = {
  onRemove: null,
};

export default ListItemDomainWhitelisted;
