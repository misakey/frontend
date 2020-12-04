import { useMemo } from 'react';
import PropTypes from 'prop-types';

import useSafeDestr from '@misakey/hooks/useSafeDestr';

import Avatar from '@misakey/ui/Avatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';

import DomainIcon from '@material-ui/icons/Domain';

// COMPONENTS
const ListItemDomain = ({ displayName, identifier, children, classes, ...rest }) => {
  const { listItemText, ...listItemClasses } = useSafeDestr(classes);

  const identifierWithPrefix = useMemo(
    () => `@${identifier}`,
    [identifier],
  );
  return (
    <ListItem classes={listItemClasses} {...rest}>
      <ListItemAvatar>
        <Avatar>
          <DomainIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        className={listItemText}
        primary={displayName}
        secondary={identifierWithPrefix}
        primaryTypographyProps={{ color: 'textPrimary', noWrap: true }}
        secondaryTypographyProps={{ color: 'textSecondary' }}
      />
      {children}
    </ListItem>
  );
};

ListItemDomain.propTypes = {
  identifier: PropTypes.string,
  displayName: PropTypes.string,
  children: PropTypes.node,
  classes: PropTypes.shape({
    listItemText: PropTypes.string,
  }),
};

ListItemDomain.defaultProps = {
  identifier: '',
  displayName: '',
  children: null,
  classes: {
    listItemText: '',
  },
};

export default ListItemDomain;
