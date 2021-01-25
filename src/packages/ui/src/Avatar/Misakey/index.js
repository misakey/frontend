import React from 'react';
import PropTypes from 'prop-types';
import Logo from '@misakey/ui/Logo';
import Avatar from '@misakey/ui/Avatar';

// COMPONENTS
const AvatarMisakey = ({ large, ...props }) => (
  <Logo
    alt="Misakey"
    large={large}
    component={Avatar}
    short
    {...props}
  />
);

AvatarMisakey.propTypes = {
  large: PropTypes.bool,
};

AvatarMisakey.defaultProps = {
  large: false,
};

export default AvatarMisakey;
