import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { Link } from 'react-router-dom';

import { DRAWER_PROPS_PROP_TYPES } from 'components/smart/Screen/Drawer';
import AppBarDrawer, { SIDES } from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import UserAccountAvatar from 'components/smart/Avatar/CurrentUser';
import List from '@material-ui/core/List';
import ListItemNavLinkMisakey from 'components/smart/ListItem/NavLink/Misakey';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';
import TabsMenu from 'components/dumb/Tabs/DrawerMenu';
import TabsMenuSkeleton from 'components/dumb/Tabs/DrawerMenu/Skeleton';

// CONSTANTS
const ACCOUNT = 'account';

// COMPONENTS
function AccountList({ drawerWidth, animationDone, getNextDrawerSearch, t }) {
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
          <UserAccountAvatar />
        </IconButtonAppBar>
        {animationDone ? <TabsMenu /> : <TabsMenuSkeleton />}
        <IconButtonAppBar
          aria-label="create-account"
          edge="end"
          color="secondary"
          disabled
        >
          <AddIcon />
        </IconButtonAppBar>
      </AppBarDrawer>
      <List disablePadding>
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
  drawerWidth: DRAWER_PROPS_PROP_TYPES.drawerWidth.isRequired,
  getNextDrawerSearch: DRAWER_PROPS_PROP_TYPES.getNextDrawerSearch.isRequired,
  animationDone: DRAWER_PROPS_PROP_TYPES.animationDone.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

AccountList.defaultProps = {
};

export default withTranslation('account')(AccountList);
