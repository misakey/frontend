import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import routes from 'routes';
import { Link, generatePath } from 'react-router-dom';

import Button from '@misakey/ui/Button';
import AppBarDrawer, { SIDES } from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import TabsMenu from 'components/dumb/Tabs/DrawerMenu';

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

// CONSTANTS
const ACCOUNT = 'account';

function AccountList({ drawerWidth, getNextDrawerSearch }) {
  const classes = useStyles();
  const openAccountDrawer = useCallback(
    () => getNextDrawerSearch(ACCOUNT, true), [getNextDrawerSearch],
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
          aria-label="create-account"
          edge="end"
          color="secondary"
          onClick={() => { }}
        >
          <AddIcon />
        </IconButtonAppBar>
      </AppBarDrawer>
      <Box p={2}>
        <Typography>List of accounts</Typography>
        <Button
          component={Link}
          to={generatePath(routes.accounts.read._, { id: '1' })}
          text="Voir le compte 1"
        />
      </Box>
    </>
  );
}

AccountList.propTypes = {
  // DRAWER
  drawerWidth: PropTypes.string.isRequired,
  getNextDrawerSearch: PropTypes.func.isRequired,
};

AccountList.defaultProps = {
};

export default AccountList;
