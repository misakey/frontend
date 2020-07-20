import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import STATUSES from 'constants/app/boxes/statuses';

import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import usePaginateBoxesByStatusRefresh from 'hooks/usePaginateBoxesByStatus/refresh';

import { DRAWER_PROPS_PROP_TYPES } from 'components/smart/Screen/Drawer';
import AppBarDrawer, { SIDES } from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import TabsMenu from 'components/dumb/Tabs/DrawerMenu';
import OpenDrawerAccountButton from 'components/smart/Button/Drawer/Account';
import withDialogCreate from 'components/smart/Dialog/Boxes/Create/with';
import withDialogPassword from 'components/smart/Dialog/Password/with';

import AddIcon from '@material-ui/icons/Add';

// COMPONENTS
const IconButtonCreate = withDialogCreate(withDialogPassword(IconButtonAppBar));

function ListHeader({ drawerWidth, isDrawerOpen, activeStatus, t }) {
  const { search } = useLocationSearchParams();

  const onCreateSuccess = usePaginateBoxesByStatusRefresh(activeStatus, search);

  const dialogProps = useMemo(
    () => ({
      onSuccess: onCreateSuccess,
    }),
    [onCreateSuccess],
  );

  return (
    <AppBarDrawer side={SIDES.LEFT} drawerWidth={drawerWidth} isDrawerOpen={isDrawerOpen}>
      <OpenDrawerAccountButton />
      <TabsMenu />
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
  isDrawerOpen: DRAWER_PROPS_PROP_TYPES.isDrawerOpen.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'])(ListHeader);
