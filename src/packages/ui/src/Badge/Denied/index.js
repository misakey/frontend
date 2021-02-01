import React from 'react';
import PropTypes from 'prop-types';

import Badge from '@material-ui/core/Badge';

import NotInterestedIcon from '@material-ui/icons/NotInterested';

// COMPONENTS
const BadgeDenied = ({ fontSize, children, ...props }) => (
  <Badge
    overlap="circle"
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    badgeContent={<NotInterestedIcon fontSize={fontSize} color="error" />}
    {...props}
  >
    {children}
  </Badge>
);

BadgeDenied.propTypes = {
  fontSize: PropTypes.oneOf(['small', 'default', 'large', 'inherit']),
  children: PropTypes.node,
};

BadgeDenied.defaultProps = {
  fontSize: 'default',
  children: null,
};

export default BadgeDenied;
