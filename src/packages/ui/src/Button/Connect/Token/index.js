import React, { useState, useMemo, useCallback } from 'react';
import API from '@misakey/api';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import noop from '@misakey/helpers/noop';
import isFunction from '@misakey/helpers/isFunction';
import isObject from '@misakey/helpers/isObject';
import pick from '@misakey/helpers/pick';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useParseIdToken from '@misakey/hooks/useParseIdToken';

import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';

import AvatarUser from '../../../Avatar/User';


// HELPERS
const pickAvatarUserProps = pick(['avatarUri', 'displayName']);

// HOOKS
const useHandleMenu = (setAnchorEl) => useCallback(
  (event) => setAnchorEl(event.currentTarget),
  [setAnchorEl],
);
const useHandleClose = (setAnchorEl) => useCallback(() => setAnchorEl(null), [setAnchorEl]);
const useOpen = (anchorEl) => useMemo(() => Boolean(anchorEl), [anchorEl]);

const useHandleSignOut = (onSignOut, handleClose, userId, handleHttpErrors) => useCallback(
  (event) => {
    const proxyOnSignOut = isFunction(onSignOut) ? onSignOut : noop;
    if (userId) {
      API.use(API.endpoints.auth.signOut)
        .build(null, { user_id: userId })
        .send()
        .catch(handleHttpErrors)
        .finally(() => {
          proxyOnSignOut(event);
          handleClose();
        });
    } else {
      proxyOnSignOut(event);
      handleClose();
    }
  }, [
    onSignOut,
    handleClose,
    userId,
    handleHttpErrors,
  ],
);

// COMPONENTS
const ButtonConnectToken = ({
  AccountLink,
  className,
  classes,
  customAction,
  disabled,
  id,
  onSignOut,
  profile,
  t,
  token,
  ...rest
}) => {
  const classProps = useMemo(
    () => (isObject(classes) ? { classes } : { className }),
    [classes, className],
  );

  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenu = useHandleMenu(setAnchorEl);
  const handleClose = useHandleClose(setAnchorEl);

  const handleHttpErrors = useHandleHttpErrors();

  const { sub: userId, acr } = useParseIdToken(id);
  const seclevel = useMemo(() => parseInt(acr, 10), [acr]);

  const handleSignOut = useHandleSignOut(onSignOut, handleClose, userId, handleHttpErrors);

  const avatarUserProps = useMemo(
    () => (isObject(profile) ? pickAvatarUserProps(profile) : {}),
    [profile],
  );

  const iconButtonAction = useMemo(
    () => (isFunction(customAction) ? customAction : handleMenu),
    [customAction, handleMenu],
  );

  const open = useOpen(anchorEl);

  if (!token) { return null; }

  return (
    <>
      <IconButton
        aria-label={t('components:buttonConnect.currentUser')}
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={iconButtonAction}
        color="inherit"
        edge="end"
        disabled={disabled}
        {...classProps}
        {...omitTranslationProps(rest)}
      >
        <AvatarUser
          {...avatarUserProps}
        />
      </IconButton>
      {!disabled && (
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={open}
          onClose={handleClose}
        >
          {seclevel > 1 && (
            <MenuItem
              button
              component={AccountLink}
              onClick={handleClose}
            >
              {t('components:buttonConnect.profile')}
            </MenuItem>
          )}
          {seclevel > 1 && ( // duplicated because Menu doesn't accept React.Fragment as a child
            <Divider light />
          )}
          <MenuItem button component="li" onClick={handleSignOut}>
            {t('components:buttonConnect.signOut')}
          </MenuItem>
        </Menu>
      )}
    </>
  );
};

ButtonConnectToken.propTypes = {
  // COMPONENT
  AccountLink: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),

  classes: PropTypes.object,
  className: PropTypes.string,
  customAction: PropTypes.func,
  disabled: PropTypes.bool,

  id: PropTypes.string,

  onSignOut: PropTypes.func,
  profile: PropTypes.shape({
    avatarUri: PropTypes.string,
    displayName: PropTypes.string,
    email: PropTypes.string,
  }),
  t: PropTypes.func.isRequired,
  token: PropTypes.string,
};

ButtonConnectToken.defaultProps = {
  AccountLink: Link,
  className: '',
  classes: null,
  customAction: null,
  disabled: false,
  id: null,
  onSignOut: null,
  profile: null,
  token: null,
};

export default withTranslation('components')(ButtonConnectToken);
