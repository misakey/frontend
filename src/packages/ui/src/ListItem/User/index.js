import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import useSafeDestr from '@misakey/hooks/useSafeDestr';

import AvatarUser from '@misakey/ui/Avatar/User';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';

// COMPONENTS
const ListItemUser = forwardRef(({
  displayName, avatarUrl, identifier,
  isMe,
  children,
  classes,
  avatarProps,
  listItemTextProps,
  ...rest
}, ref) => {
  const { t } = useTranslation('common');
  const { listItemText, listItemAvatar, ...listItemClasses } = useSafeDestr(classes);
  return (
    <ListItem ref={ref} classes={listItemClasses} {...rest}>
      <ListItemAvatar classes={{ root: listItemAvatar }}>
        <AvatarUser
          displayName={displayName}
          identifier={identifier}
          avatarUrl={avatarUrl}
          {...avatarProps}
        />
      </ListItemAvatar>
      <ListItemText
        className={listItemText}
        primary={isMe ? t('common:you', { displayName }) : displayName}
        secondary={identifier}
        primaryTypographyProps={{ color: 'textPrimary', noWrap: true }}
        secondaryTypographyProps={{ color: 'textSecondary' }}
        {...listItemTextProps}
      />
      {children}
    </ListItem>
  );
});
ListItemUser.propTypes = {
  identifier: PropTypes.string,
  displayName: PropTypes.string,
  avatarUrl: PropTypes.string,
  isMe: PropTypes.bool,
  children: PropTypes.node,
  classes: PropTypes.shape({
    listItemText: PropTypes.string,
    ListItemAvatar: PropTypes.string,
  }),
  avatarProps: PropTypes.object,
  listItemTextProps: PropTypes.object,
};

ListItemUser.defaultProps = {
  identifier: '',
  displayName: '',
  avatarUrl: '',
  children: null,
  isMe: false,
  classes: {
    listItemText: '',
    listItemAvatar: '',
  },
  avatarProps: {},
  listItemTextProps: {},
};

export default ListItemUser;
