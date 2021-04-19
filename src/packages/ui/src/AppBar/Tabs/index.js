import React, { useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';

import useXsMediaQuery from '@misakey/hooks/useXsMediaQuery';

import MuiAppBar from '@material-ui/core/AppBar';
import Tabs from '@misakey/ui/Tabs';

// CONSTANTS
export const PROP_TYPES = {
  tabsProps: PropTypes.object,
  children: PropTypes.node,
};

// COMPONENTS
const AppBarTabs = forwardRef(({
  tabsProps,
  children,
  ...props
}, ref) => {
  const isXs = useXsMediaQuery();

  const variant = useMemo(
    () => (isXs ? 'fullWidth' : undefined),
    [isXs],
  );

  const centered = useMemo(
    () => !isXs,
    [isXs],
  );

  return (
    <MuiAppBar
      ref={ref}
      position="static"
      color="inherit"
      elevation={0}
      {...props}
    >
      <Tabs
        variant={variant}
        centered={centered}
        {...tabsProps}
      >
        {children}
      </Tabs>
    </MuiAppBar>
  );
});

AppBarTabs.propTypes = PROP_TYPES;

AppBarTabs.defaultProps = {
  children: null,
  tabsProps: {},
};

export default AppBarTabs;
