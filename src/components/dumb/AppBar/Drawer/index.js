import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Box from '@material-ui/core/Box';
import clsx from 'clsx';

export const SIDES = {
  RIGHT: 'right',
  LEFT: 'left',
};

const useStyles = makeStyles((theme) => ({
  appBarLeft: ({ drawerWidth }) => ({
    width: drawerWidth,
    left: 0,
  }),
  appBarRight: {
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: ({ drawerWidth }) => ({
    width: `calc(100% - ${drawerWidth})`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  // necessary for content to be below app bar
  offset: ({ offsetHeight }) => ({
    ...theme.mixins.toolbar,
    ...(offsetHeight ? { height: `${offsetHeight}px` } : {}),
  }),
}));

function AppBarDrawer({
  drawerWidth,
  isDrawerOpen,
  children,
  side,
  toolbarProps,
  offsetHeight,
  disableOffset,
  ...props
}) {
  const classes = useStyles({ drawerWidth, offsetHeight });

  return (
    <>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        className={clsx({
          [classes.appBarLeft]: side === SIDES.LEFT,
          [classes.appBarRight]: side === SIDES.RIGHT,
          [classes.appBarShift]: side === SIDES.RIGHT && isDrawerOpen,
        })}
        {...props}
      >
        <Toolbar component={Box} px={2} disableGutters {...toolbarProps}>
          {children}
        </Toolbar>
      </AppBar>
      {!disableOffset && <Box className={classes.offset} />}
    </>
  );
}

AppBarDrawer.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
  drawerWidth: PropTypes.string.isRequired,
  isDrawerOpen: PropTypes.bool.isRequired,
  toolbarProps: PropTypes.object,
  offsetHeight: PropTypes.number,
  disableOffset: PropTypes.bool,
  side: PropTypes.oneOf(Object.values(SIDES)),
};

AppBarDrawer.defaultProps = {
  children: null,
  toolbarProps: {},
  offsetHeight: null,
  disableOffset: false,
  side: SIDES.RIGHT,
};

export default AppBarDrawer;
