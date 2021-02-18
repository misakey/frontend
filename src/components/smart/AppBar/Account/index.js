import React, { useState, useCallback } from 'react';

import AppBarStatic from '@misakey/ui/AppBar/Static';
import OpenDrawerAccountButton from 'components/smart/Button/Drawer/Account';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import Box from '@material-ui/core/Box';
import ListBordered from '@misakey/ui/List/Bordered';
import ListItemOrganizationCurrent from 'components/smart/ListItem/Organization/Current';
import IconButtonNotificationsMisakey from 'components/smart/IconButton/Notifications/Misakey';
import PopoverOrganizations from 'components/smart/Popover/Organizations';

// COMPONENTS
const AppBarAccount = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const onClick = useCallback(
    (event) => {
      setAnchorEl(event.currentTarget);
    },
    [setAnchorEl],
  );

  const onClose = useCallback(
    () => {
      setAnchorEl(null);
    },
    [setAnchorEl],
  );

  return (
    <AppBarStatic
      {...props}
    >
      <ListBordered
        dense
        disablePadding
      >
        <ListItemOrganizationCurrent
          button
          onClick={onClick}
        />
        <PopoverOrganizations
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={onClose}
        />
      </ListBordered>
      <BoxFlexFill />
      <Box mr={1}>
        <IconButtonNotificationsMisakey size="small" />
      </Box>
      <OpenDrawerAccountButton />
    </AppBarStatic>
  );
};

AppBarAccount.propTypes = {
};

export default AppBarAccount;
