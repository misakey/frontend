import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Box from '@material-ui/core/Box';

export const SIDES = {
  RIGHT: 'right',
  LEFT: 'left',
};

const useStyles = makeStyles((theme) => ({
  appBar: ({ drawerWidth, side }) => (side === SIDES.RIGHT
    ? {
      [theme.breakpoints.up('sm')]: {
        width: `calc(100% - ${drawerWidth})`,
        marginLeft: drawerWidth,
      },
    }
    : {
      width: drawerWidth,
      left: 0,
      right: 'auto',
    }),
  // necessary for content to be below app bar
  offset: theme.mixins.toolbar,
}));

function AppBarDrawer({ drawerWidth, children, side, toolbarProps, ...props }) {
  const classes = useStyles({ drawerWidth, side });
  return (
    <>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        className={classes.appBar}
        {...props}
      >
        <Toolbar component={Box} px={2} disableGutters {...toolbarProps}>
          {children}
        </Toolbar>
      </AppBar>
      <Box className={classes.offset} />
    </>
  );
}

AppBarDrawer.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
  drawerWidth: PropTypes.string.isRequired,
  toolbarProps: PropTypes.object,
  side: PropTypes.oneOf(Object.values(SIDES)),
};

AppBarDrawer.defaultProps = {
  children: null,
  toolbarProps: {},
  side: SIDES.RIGHT,
};

export default AppBarDrawer;
