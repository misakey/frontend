import React, { useState, useCallback, useRef, useEffect } from 'react';

import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';

import { useSelector } from 'react-redux';

import AppBarStatic from '@misakey/ui/AppBar/Static';
import IconButtonMenuAccount from 'components/smart/IconButton/Menu/Account';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import Box from '@material-ui/core/Box';
import ListBordered from '@misakey/ui/List/Bordered';
import ListItemOrganizationCurrent from 'components/smart/ListItem/Organization/Current';
import IconButtonNotificationsMisakey from 'components/smart/IconButton/Notifications/Misakey';
import MenuNotificationsMisakey from 'components/smart/Menu/Notifications/Misakey';
import PopoverOrganizations from 'components/smart/Popover/Organizations';
import { isNil } from 'lodash-es';

// CONSTANTS
const {
  acr: ACR_SELECTOR,
} = authSelectors;

// COMPONENTS
const AppBarAccount = (props) => {
  const [orgAnchorEl, setOrgAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const notifButtonRef = useRef();

  const currentAcr = useSelector(ACR_SELECTOR);

  const onOrgClick = useCallback(
    (event) => {
      setOrgAnchorEl(event.currentTarget);
    },
    [setOrgAnchorEl],
  );

  const onNotifClick = useCallback(
    (event) => {
      setNotifAnchorEl(event.currentTarget);
    },
    [setNotifAnchorEl],
  );

  const onOrgClose = useCallback(
    () => {
      setOrgAnchorEl(null);
    },
    [setOrgAnchorEl],
  );

  const onNotifClose = useCallback(
    () => {
      setNotifAnchorEl(null);
    },
    [setNotifAnchorEl],
  );

  useEffect(
    () => {
      const { current } = notifButtonRef;
      if ((isNil(currentAcr) || currentAcr <= 1) && !isNil(current)) {
        requestAnimationFrame(
          () => setNotifAnchorEl(current),
        );
      }
    },
    [currentAcr, setNotifAnchorEl, notifButtonRef],
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
          onClick={onOrgClick}
        />
        <PopoverOrganizations
          anchorEl={orgAnchorEl}
          open={Boolean(orgAnchorEl)}
          onClose={onOrgClose}
        />
      </ListBordered>
      <BoxFlexFill />
      <Box mr={1}>
        <IconButtonNotificationsMisakey
          ref={notifButtonRef}
          selected={Boolean(notifAnchorEl)}
          onClick={onNotifClick}
          size="small"
        />
        <MenuNotificationsMisakey
          anchorEl={notifAnchorEl}
          open={Boolean(notifAnchorEl)}
          onClose={onNotifClose}

        />
      </Box>
      <IconButtonMenuAccount />
    </AppBarStatic>
  );
};

AppBarAccount.propTypes = {
};

export default AppBarAccount;
