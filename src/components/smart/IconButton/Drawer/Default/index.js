import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { useScreenDrawerContext } from 'components/smart/Screen/Drawer';

import IconButtonAppBar from '@misakey/ui/IconButton/AppBar';

// COMPONENTS
const IconButtonDrawerDefault = ({ children, ...props }) => {
  const { isDrawerOpen, toggleDrawer } = useScreenDrawerContext();

  const onClick = useCallback(
    (e) => {
      e.stopPropagation();
      e.preventDefault();
      toggleDrawer();
    },
    [toggleDrawer],
  );


  if (isDrawerOpen) {
    return null;
  }

  return (
    <IconButtonAppBar
      edge="start"
      onClick={onClick}
      {...props}
    >
      {children}
    </IconButtonAppBar>
  );
};

IconButtonDrawerDefault.propTypes = {
  children: PropTypes.node,
};

IconButtonDrawerDefault.defaultProps = {
  children: null,
};

export default IconButtonDrawerDefault;
