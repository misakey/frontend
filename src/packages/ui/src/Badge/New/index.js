import React from 'react';
import PropTypes from 'prop-types';

import Badge from '@material-ui/core/Badge';

import NewReleasesIcon from '@material-ui/icons/NewReleases';

// COMPONENTS
const BadgeNew = ({ fontSize, children, isNew, ...props }) => {
  if (!isNew) {
    return children;
  }
  return (
    <Badge
      overlap="circle"
      badgeContent={<NewReleasesIcon color="primary" fontSize={fontSize} />}
      {...props}
    >
      {children}
    </Badge>
  );
};

BadgeNew.propTypes = {
  fontSize: PropTypes.oneOf(['small', 'default', 'large', 'inherit']),
  children: PropTypes.node,
  isNew: PropTypes.bool,
};

BadgeNew.defaultProps = {
  fontSize: 'default',
  children: null,
  isNew: false,
};

export default BadgeNew;
