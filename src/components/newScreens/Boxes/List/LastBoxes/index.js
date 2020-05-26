import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import routes from 'routes';
import { Link, generatePath } from 'react-router-dom';

import Button from '@misakey/ui/Button';
import AppBarDrawer, { SIDES } from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import TabsMenu from 'components/dumb/Tabs/DrawerMenu';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';

const SEARCH = 'search';
const ACCOUNT = 'account';

const useStyles = makeStyles((theme) => ({
  title: {
    flexGrow: 1,
  },
  avatar: {
    [theme.breakpoints.down('sm')]: {
      height: '35px',
      width: '35px',
    },
  },
}));

function LastBoxes({ drawerWidth, getNextDrawerSearch }) {
  const classes = useStyles();
  const openSearch = useCallback(() => getNextDrawerSearch(SEARCH), [getNextDrawerSearch]);
  const openAccountDrawer = useCallback(
    () => getNextDrawerSearch(ACCOUNT, true),
    [getNextDrawerSearch],
  );

  return (
    <>
      <AppBarDrawer side={SIDES.LEFT} drawerWidth={drawerWidth}>
        <IconButtonAppBar
          aria-label="user-account"
          component={Link}
          to={openAccountDrawer}
          edge="start"
        >
          <Avatar classes={{ root: classes.avatar }}>U</Avatar>
        </IconButtonAppBar>
        <TabsMenu />
        <IconButtonAppBar
          aria-label="create-box"
          edge="end"
          color="secondary"
        >
          <AddIcon />
        </IconButtonAppBar>
      </AppBarDrawer>
      <Box p={2}>
        <Typography>List of chat</Typography>
        <Button
          component={Link}
          to={openSearch}
          text="Rechercher"
        />
        <Button
          component={Link}
          to={generatePath(routes.boxes.read._, { id: '1' })}
          text="Voir la box 1"
        />
      </Box>
    </>
  );
}

LastBoxes.propTypes = {
  // DRAWER
  drawerWidth: PropTypes.string.isRequired,
  getNextDrawerSearch: PropTypes.func.isRequired,
};

export default LastBoxes;
