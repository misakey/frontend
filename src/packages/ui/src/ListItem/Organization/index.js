import React from 'react';
import PropTypes from 'prop-types';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';

// COMPONENTS
const ListItemOrganization = ({
  name, avatar, children, ...rest
}) => (
  <ListItem {...rest}>
    <ListItemAvatar>
      {avatar}
    </ListItemAvatar>
    <ListItemText
      primary={name}
      primaryTypographyProps={{ color: 'textPrimary', noWrap: true }}
    />
    {children}
  </ListItem>
);
ListItemOrganization.propTypes = {
  name: PropTypes.string,
  avatar: PropTypes.node,
  children: PropTypes.node,
};

ListItemOrganization.defaultProps = {
  name: '',
  avatar: null,
  children: null,
};

export default ListItemOrganization;
