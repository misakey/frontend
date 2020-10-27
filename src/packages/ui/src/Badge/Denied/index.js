import React from 'react';
import PropTypes from 'prop-types';

import Badge from '@material-ui/core/Badge';

import NotInterestedIcon from '@material-ui/icons/NotInterested';

// COMPONENTS
const BadgeDenied = ({ large, children, ...props }) => (
  <Badge
    overlap="circle"
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    badgeContent={<NotInterestedIcon fontSize={large ? 'large' : undefined} color="error" />}
    {...props}
  >
    {children}
  </Badge>
);

BadgeDenied.propTypes = {
  large: PropTypes.bool,
  children: PropTypes.node,
};

BadgeDenied.defaultProps = {
  large: false,
  children: null,
};

export default BadgeDenied;
