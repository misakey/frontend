import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';

import { Link } from 'react-router-dom';

import AppBarDrawer, { SIDES } from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import UserAccountAvatar from 'components/smart/Avatar/CurrentUser';
import List from '@material-ui/core/List';
import ListItemNavLinkMisakey from 'components/smart/ListItem/NavLink/Misakey';
import ListItemText from '@material-ui/core/ListItemText';
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

// COMPONENTS
function AccountList({ drawerWidth, getNextDrawerSearch, t }) {
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
          <UserAccountAvatar classes={{ root: classes.avatar }} />
        </IconButtonAppBar>
        <TabsMenu />
        <IconButtonAppBar
          aria-label="create-account"
          edge="end"
          color="secondary"
          disabled
        >
          <AddIcon />
        </IconButtonAppBar>
      </AppBarDrawer>
      <List>
        <ListItemNavLinkMisakey
          button
        >
          <ListItemText
            primary={t('account:misakey')}
          />
        </ListItemNavLinkMisakey>
      </List>
    </>
  );
}

AccountList.propTypes = {
  // DRAWER
  drawerWidth: PropTypes.string.isRequired,
  getNextDrawerSearch: PropTypes.func.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

AccountList.defaultProps = {
};

export default withTranslation('account')(AccountList);
