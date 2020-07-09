import React from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import MenuIcon from '@material-ui/icons/Menu';
import Title from '@misakey/ui/Typography/Title';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

function AccountRead({ match, toggleDrawer, isDrawerOpen, drawerWidth }) {
  const account = { id: match.params.id };
  return (
    <>
      <Switch>
        <Route
          exact
          path={match.path}
          render={() => (
            <>
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
                <Title gutterBottom={false}>
                  Account view
                </Title>
              </AppBarDrawer>
              <Box p={2}>
                <Typography>
                  Enjoy
                  {' '}
                  {account.id}
                </Typography>
              </Box>
            </>
          )}
        />
      </Switch>
    </>

  );
}

AccountRead.propTypes = {
  match: PropTypes.shape({
    path: PropTypes.string,
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }).isRequired,
  account: PropTypes.shape({ id: PropTypes.string.isRequired }),
  // DRAWER
  toggleDrawer: PropTypes.func.isRequired,
  isDrawerOpen: PropTypes.bool,
  drawerWidth: PropTypes.string.isRequired,
};

AccountRead.defaultProps = {
  isDrawerOpen: false,
  account: null,
};

export default AccountRead;
