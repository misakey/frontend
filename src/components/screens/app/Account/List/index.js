import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { SIDES } from '@misakey/ui/constants/drawers';
import { DRAWER_PROPS_PROP_TYPES } from 'components/smart/Screen/Drawer';
import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import List from '@material-ui/core/List';
import ListItemNavLinkMisakey from 'components/smart/ListItem/NavLink/Misakey';
import ListItemText from '@material-ui/core/ListItemText';
import AddIcon from '@material-ui/icons/Add';
import TabsMenu from 'components/dumb/Tabs/DrawerMenu';
import OpenDrawerAccountButton from 'components/smart/Button/Drawer/Account';

// COMPONENTS
function AccountList({ drawerWidth, isDrawerOpen, t }) {
  return (
    <>
      <AppBarDrawer side={SIDES.LEFT} drawerWidth={drawerWidth} isDrawerOpen={isDrawerOpen}>
        <OpenDrawerAccountButton />
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
  isDrawerOpen: DRAWER_PROPS_PROP_TYPES.isDrawerOpen.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation('account')(AccountList);
