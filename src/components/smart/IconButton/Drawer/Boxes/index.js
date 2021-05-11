import React from 'react';

import { TMP_DRAWER_BOXES_VALUE } from '@misakey/ui/constants/drawers';

import IconButtonDrawerTemporary from '@misakey/ui/IconButton/Drawer/Temporary';

import MenuIcon from '@material-ui/icons/Menu';

// COMPONENTS
const IconButtonDrawerOrganization = (props) => (
  <IconButtonDrawerTemporary
    {...props}
    searchKey={TMP_DRAWER_BOXES_VALUE}
  >
    <MenuIcon />
  </IconButtonDrawerTemporary>
);

export default IconButtonDrawerOrganization;
