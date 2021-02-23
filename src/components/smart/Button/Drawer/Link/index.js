import React from 'react';
import PropTypes from 'prop-types';

import { TO_PROP_TYPE } from '@misakey/ui/constants/propTypes';

import { useScreenDrawerContext } from 'components/smart/Screen/Drawer';

import { Link } from 'react-router-dom';
import IconButtonAppBar from '@misakey/ui/IconButton/AppBar';

// COMPONENTS
const ButtonDrawerLink = ({ to, children, ...props }) => {
  const { isDrawerOpen } = useScreenDrawerContext();

  if (isDrawerOpen) {
    return null;
  }

  return (
    <IconButtonAppBar
      edge="start"
      component={Link}
      to={to}
      {...props}
    >
      {children}
    </IconButtonAppBar>
  );
};

ButtonDrawerLink.propTypes = {
  to: TO_PROP_TYPE.isRequired,
  children: PropTypes.node,
};

ButtonDrawerLink.defaultProps = {
  children: null,
};

export default ButtonDrawerLink;
