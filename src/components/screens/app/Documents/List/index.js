import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link, useRouteMatch } from 'react-router-dom';

import makeStyles from '@material-ui/core/styles/makeStyles';

import isNil from '@misakey/helpers/isNil';
import { SIDES } from '@misakey/ui/constants/drawers';
import { DRAWER_PROPS_PROP_TYPES } from 'components/smart/Screen/Drawer';
import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import TabsMenu from 'components/dumb/Tabs/DrawerMenu';
import FolderIcon from '@material-ui/icons/Folder';
import OpenDrawerAccountButton from 'components/smart/Button/Drawer/Account';
import routes from 'routes';

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatar: {
    backgroundColor: theme.palette.secondary.main,
  },
}));

// COMPONENTS
function DocumentsList({ drawerWidth, isDrawerOpen, t }) {
  const classes = useStyles();

  const match = useRouteMatch({
    path: routes.documents.vault,
    exact: true,
  });

  const selected = useMemo(
    () => !isNil(match),
    [match],
  );

  return (
    <>
      <AppBarDrawer side={SIDES.LEFT} drawerWidth={drawerWidth} isDrawerOpen={isDrawerOpen}>
        <OpenDrawerAccountButton />
        <TabsMenu />
      </AppBarDrawer>
      <List disablePadding>
        <ListItem
          component={Link}
          to={routes.documents.vault}
          selected={selected}
          button
        >
          <ListItemAvatar>
            <Avatar className={classes.avatar}>
              <FolderIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={t('document:vault.title')}
          />
        </ListItem>
      </List>
    </>
  );
}

DocumentsList.propTypes = {
  // DRAWER
  drawerWidth: DRAWER_PROPS_PROP_TYPES.drawerWidth.isRequired,
  isDrawerOpen: DRAWER_PROPS_PROP_TYPES.isDrawerOpen.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation('document')(DocumentsList);
