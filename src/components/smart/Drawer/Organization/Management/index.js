import React from 'react';

import {
  TMP_DRAWER_ORG_MANAGEMENT_VALUE,
  HIDE_DRAWER_MAP,
} from '@misakey/ui/constants/drawers';

import DrawerTemporary from '@misakey/ui/Drawer/Temporary';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import Box from '@material-ui/core/Box';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import ListBordered from '@misakey/ui/List/Bordered';
import ListItemOrganizationCurrent from 'components/smart/ListItem/Organization/Current';
import IconButtonAppBarDrawerTemporaryBack from '@misakey/ui/IconButton/AppBar/Drawer/Temporary/Back';
import ListNavigationOrganization from 'components/smart/List/Organization/Navigation';

// COMPONENTS
const DrawerOrganizationManagement = (props) => (
  <DrawerTemporary
    searchKey={TMP_DRAWER_ORG_MANAGEMENT_VALUE}
    {...props}
  >
    <Box minHeight="100%" display="flex" flexDirection="column" overflow="hidden">
      <AppBarStatic>
        <IconButtonAppBarDrawerTemporaryBack />
        <BoxFlexFill />
        <ListBordered
          dense
          disablePadding
        >
          <ListItemOrganizationCurrent />
        </ListBordered>
      </AppBarStatic>
      <ListNavigationOrganization nextSearchMap={HIDE_DRAWER_MAP} />
    </Box>
  </DrawerTemporary>
);

export default DrawerOrganizationManagement;
