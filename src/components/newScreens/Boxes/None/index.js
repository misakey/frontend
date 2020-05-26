import React from 'react';
import PropTypes from 'prop-types';

import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import MenuIcon from '@material-ui/icons/Menu';
import Button from '@misakey/ui/Button';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';


function BoxNone({ drawerWidth, isDrawerOpen, toggleDrawer }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      style={{ height: 'inherit' }}
    >
      <AppBarDrawer drawerWidth={drawerWidth}>
        {!isDrawerOpen && (
        <IconButtonAppBar
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={toggleDrawer}
        >
          <MenuIcon />
        </IconButtonAppBar>
        )}
      </AppBarDrawer>

      <Typography>Sélectionner une boîte pour commencer</Typography>
      {!isDrawerOpen && <Button text="Sélectionner" onClick={toggleDrawer} />}
    </Box>

  );
}

BoxNone.propTypes = {
  drawerWidth: PropTypes.string.isRequired,
  isDrawerOpen: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
};

export default BoxNone;
