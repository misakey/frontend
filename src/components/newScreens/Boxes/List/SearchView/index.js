import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import AppBarDrawer, { SIDES } from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import ArrowBack from '@material-ui/icons/ArrowBack';

function SearchView({ drawerWidth, getNextDrawerSearch }) {
  const goBack = useMemo(() => getNextDrawerSearch(undefined), [getNextDrawerSearch]);
  return (
    <>
      <AppBarDrawer side={SIDES.LEFT} drawerWidth={drawerWidth}>
        <IconButtonAppBar
          color="inherit"
          aria-label="open drawer"
          edge="start"
          component={Link}
          to={goBack}
        >
          <ArrowBack />
        </IconButtonAppBar>
      </AppBarDrawer>
      <Box p={2}>
        <Typography>This is the search view ! </Typography>
      </Box>
    </>
  );
}

SearchView.propTypes = {
  // DRAWER
  drawerWidth: PropTypes.string.isRequired,
  getNextDrawerSearch: PropTypes.func.isRequired,
};

export default SearchView;
