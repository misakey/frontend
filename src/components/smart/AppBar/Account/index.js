import React, { useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import { useSelector } from 'react-redux';

import AppBarStatic from '@misakey/ui/AppBar/Static';
import IconButtonMenuAccount from 'components/smart/IconButton/Menu/Account';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import IconButtonNotificationsMisakey from 'components/smart/IconButton/Notifications/Misakey';
import MenuNotificationsMisakey from 'components/smart/Menu/Notifications/Misakey';
import isNil from '@misakey/core/helpers/isNil';

// CONSTANTS
const { hasCrypto: hasCryptoSelector } = authSelectors;

// COMPONENTS
const AppBarAccount = ({ component: Component, children, ...props }) => {
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const notifButtonRef = useRef();

  const hasCrypto = useSelector(hasCryptoSelector);

  const onNotifClick = useCallback(
    (event) => {
      setNotifAnchorEl(event.currentTarget);
    },
    [setNotifAnchorEl],
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
      if (hasCrypto === false && !isNil(current)) {
        requestAnimationFrame(
          () => setNotifAnchorEl(current),
        );
      }
    },
    [setNotifAnchorEl, notifButtonRef, hasCrypto],
  );

  return (
    <Component
      {...props}
    >
      <IconButtonMenuAccount />
      {children
        || <BoxFlexFill />}
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
    </Component>
  );
};

AppBarAccount.propTypes = {
  component: PropTypes.elementType,
  children: PropTypes.node,
};

AppBarAccount.defaultProps = {
  component: AppBarStatic,
  children: null,
};

export default AppBarAccount;
