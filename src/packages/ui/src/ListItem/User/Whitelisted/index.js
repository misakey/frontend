import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import {
  ACCESS_STATUS_MEMBER, ACCESS_STATUS_SUBJECT, ACCESS_STATUS_OWNER,
  ACCESS_STATUS_NEEDS_LINK, ACCESS_STATUS_INVITED,
} from '@misakey/ui/constants/accessStatus';

import isFunction from '@misakey/core/helpers/isFunction';
import isNil from '@misakey/core/helpers/isNil';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useAccessStatus from '@misakey/hooks/useAccessStatus';
import useIdentityPublicTo from '@misakey/react/auth/hooks/useIdentityPublicTo';

import ListItemUser from '@misakey/ui/ListItem/User';
import IconButtonWhitelist from '@misakey/ui/IconButton/Whitelist';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { Link } from 'react-router-dom';

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
  isSubject,
  isMember,
  ...rest }) => {
  const hasOnRemove = useMemo(
    () => isFunction(onRemove),
    [onRemove],
  );

  const canRemove = useMemo(
    () => hasOnRemove && !isOwner && !isSubject,
    [hasOnRemove, isOwner, isSubject],
  );

  const accessStatus = useAccessStatus({ isOwner, isSubject, isMember, autoInvite });

  const needsLink = useMemo(
    () => accessStatus === ACCESS_STATUS_NEEDS_LINK,
    [accessStatus],
  );

  const classes = useStyles({ needsLink });

  const identityPublicTo = useIdentityPublicTo(id);

  const listItemProps = useMemo(
    () => (!isNil(identityPublicTo) && (isMember || autoInvite)
      ? {
        button: true,
        to: identityPublicTo,
        component: Link,
      }
      : {}),
    [autoInvite, identityPublicTo, isMember],
  );

  const subtitleColor = useMemo(
    () => {
      if ([
        ACCESS_STATUS_MEMBER,
        ACCESS_STATUS_OWNER,
        ACCESS_STATUS_SUBJECT,
      ].includes(accessStatus)) {
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
      {...listItemProps}
      {...rest}
      identifier={identifier}
    >
      <ListItemSecondaryAction>
        <IconButtonWhitelist
          id={id}
          onRemove={canRemove ? onRemove : null}
          color={subtitleColor}
          accessStatus={accessStatus}
        />
      </ListItemSecondaryAction>
    </ListItemUser>
  );
};

ListItemUserWhitelisted.propTypes = {
  identifier: PropTypes.string,
  onRemove: PropTypes.func,
  autoInvite: PropTypes.bool,
  isMember: PropTypes.bool,
  isOwner: PropTypes.bool,
  isSubject: PropTypes.bool,
  id: PropTypes.string.isRequired,
};

ListItemUserWhitelisted.defaultProps = {
  identifier: '',
  onRemove: null,
  autoInvite: false,
  isMember: false,
  isOwner: false,
  isSubject: false,
};

export default ListItemUserWhitelisted;
