import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import MenuIcon from '@material-ui/icons/Menu';
import Button from '@misakey/ui/Button';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';


function AccountNone({ drawerWidth, isDrawerOpen, getNextDrawerSearch }) {
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
            component={Link}
            to={() => getNextDrawerSearch('default')}
          >
            <MenuIcon />
          </IconButtonAppBar>
        )}
      </AppBarDrawer>

      <Typography>Sélectionner un compte pour commencer</Typography>
      {!isDrawerOpen && (
        <Button
          text="Sélectionner"
          component={Link}
          to={() => getNextDrawerSearch('default')}
        />
      )}
    </Box>

  );
}

AccountNone.propTypes = {
  drawerWidth: PropTypes.string.isRequired,
  getNextDrawerSearch: PropTypes.func.isRequired,
  isDrawerOpen: PropTypes.bool.isRequired,
};

export default AccountNone;
