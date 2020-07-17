import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import STATUSES from 'constants/app/boxes/statuses';

import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import usePaginateBoxesByStatusRefresh from 'hooks/usePaginateBoxesByStatus/refresh';

import { DRAWER_PROPS_PROP_TYPES } from 'components/smart/Screen/Drawer';
import AppBarDrawer, { SIDES } from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import TabsMenu from 'components/dumb/Tabs/DrawerMenu';
import TabsMenuSkeleton from 'components/dumb/Tabs/DrawerMenu/Skeleton';
import UserAccountAvatar from 'components/smart/Avatar/CurrentUser';
import withDialogCreate from 'components/smart/Dialog/Boxes/Create/with';
import withDialogPassword from 'components/smart/Dialog/Password/with';

import AddIcon from '@material-ui/icons/Add';

// CONSTANTS
const ACCOUNT = 'account';

// COMPONENTS
const IconButtonCreate = withDialogCreate(withDialogPassword(IconButtonAppBar));

function ListHeader({ drawerWidth, animationDone, getNextDrawerSearch, activeStatus, t }) {
  const openAccountDrawer = useCallback(
    () => getNextDrawerSearch(ACCOUNT, true),
    [getNextDrawerSearch],
  );
  const { search } = useLocationSearchParams();

  const onCreateSuccess = usePaginateBoxesByStatusRefresh(activeStatus, search);

  const dialogProps = useMemo(
    () => ({
      onSuccess: onCreateSuccess,
    }),
    [onCreateSuccess],
  );

  return (
    <AppBarDrawer side={SIDES.LEFT} drawerWidth={drawerWidth}>
      <IconButtonAppBar
        aria-label={t('common:openAccountDrawer')}
        component={Link}
        to={openAccountDrawer}
        edge="start"
      >
        <UserAccountAvatar />
      </IconButtonAppBar>
      {animationDone ? <TabsMenu /> : <TabsMenuSkeleton />}
      <IconButtonCreate
        aria-label={t('boxes:list.empty.create')}
        edge="end"
        color="secondary"
        dialogProps={dialogProps}
      >
        <AddIcon />
      </IconButtonCreate>
    </AppBarDrawer>
  );
}

ListHeader.propTypes = {
  activeStatus: PropTypes.oneOf(STATUSES).isRequired,
  // DRAWER
  drawerWidth: DRAWER_PROPS_PROP_TYPES.drawerWidth.isRequired,
  getNextDrawerSearch: DRAWER_PROPS_PROP_TYPES.getNextDrawerSearch.isRequired,
  animationDone: DRAWER_PROPS_PROP_TYPES.animationDone.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'])(ListHeader);
