import React from 'react';
import PropTypes from 'prop-types';

import { useStyles } from '@misakey/ui/ListItem/Organization';

import AvatarSkeleton from '@misakey/ui/Avatar/Skeleton';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Skeleton from '@material-ui/lab/Skeleton';

// COMPONENTS
const ListItemOrganizationSkeleton = ({ children, ...rest }) => {
  const classes = useStyles();
  return (
    <ListItem {...rest}>
      <ListItemAvatar classes={{ root: classes.listItemAvatarRoot }}>
        <AvatarSkeleton
          size="small"
        />
      </ListItemAvatar>
      <ListItemText
        primary={<Skeleton width={100} />}
        primaryTypographyProps={{ color: 'textPrimary' }}
      />
      {children}
    </ListItem>
  );
};

ListItemOrganizationSkeleton.propTypes = {
  children: PropTypes.node,
};

ListItemOrganizationSkeleton.defaultProps = {
  children: null,
};

export default ListItemOrganizationSkeleton;
