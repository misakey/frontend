import React from 'react';
import Logo from '@misakey/ui/Logo';
import Avatar from '@misakey/ui/Avatar';

// COMPONENTS
const AvatarMisakey = (props) => (
  <Logo
    alt="Misakey"
    component={Avatar}
    short
    {...props}
  />
);

export default AvatarMisakey;
