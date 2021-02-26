import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import {
  ACCESS_STATUS_MEMBER, ACCESS_STATUS_NEEDS_LINK, ACCESS_STATUS_INVITED, ACCESS_STATUS_OWNER,
} from '@misakey/ui/constants/accessStatus';

import isFunction from '@misakey/helpers/isFunction';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useAccessStatus from '@misakey/hooks/useAccessStatus';

import ListItemUser from '@misakey/ui/ListItem/User';
import ListItemSecondaryActionWhitelist from '@misakey/ui/ListItemSecondaryAction/Whitelist';

// HOOKS
const useStyles = makeStyles((theme) => ({
  listItemRoot: ({ needsLink }) => ({
    backgroundColor: needsLink ? theme.palette.action.selected : null,
  }),
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
  const hasOnRemove = useMemo(
    () => isFunction(onRemove),
    [onRemove],
  );

  const canRemove = useMemo(
    () => hasOnRemove && !isOwner,
    [hasOnRemove, isOwner],
  );

  const accessStatus = useAccessStatus({ isOwner, isMember, autoInvite });

  const needsLink = useMemo(
    () => accessStatus === ACCESS_STATUS_NEEDS_LINK,
    [accessStatus],
  );

  const classes = useStyles({ needsLink });

  const subtitleColor = useMemo(
    () => {
      if (accessStatus === ACCESS_STATUS_MEMBER || accessStatus === ACCESS_STATUS_OWNER) {
        return 'secondary';
      }
      if (needsLink) {
        return 'primary';
      }
      if (accessStatus === ACCESS_STATUS_INVITED) {
        return undefined;
      }
      return undefined;
    },
    [accessStatus, needsLink],
  );

  return (
    <ListItemUser
      classes={{ root: classes.listItemRoot }}
      {...rest}
      identifier={identifier}
    >
      <ListItemSecondaryActionWhitelist
        id={id}
        onRemove={canRemove ? onRemove : null}
        color={subtitleColor}
        accessStatus={accessStatus}
      />
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
