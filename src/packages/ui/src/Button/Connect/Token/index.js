import React, { useState, useMemo, useCallback } from 'react';
import API from '@misakey/api';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import parseJwt from '@misakey/helpers/parseJwt';
import tDefault from '@misakey/helpers/tDefault';
import noop from '@misakey/helpers/noop';
import isFunction from '@misakey/helpers/isFunction';
import isObject from '@misakey/helpers/isObject';

import useHandleGenericHttpErrors from 'hooks/useHandleGenericHttpErrors';

import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import makeStyles from '@material-ui/core/styles/makeStyles';
import red from '@material-ui/core/colors/red';
import ColorizedAvatar from '../../../Avatar/Colorized';
import DeleteAccountDialog from '../../../Dialog/Account/Delete';

const useStyles = makeStyles(() => ({
  deleteButton: {
    color: red[500],
    '&:hover': {
      backgroundColor: red[50],
    },
  },
}));

// HOOKS
const useHandleMenu = (setAnchorEl) => useCallback(
  (event) => setAnchorEl(event.currentTarget),
  [setAnchorEl],
);
const useHandleClose = (setAnchorEl) => useCallback(() => setAnchorEl(null), [setAnchorEl]);
const useOpen = (anchorEl) => useMemo(() => Boolean(anchorEl), [anchorEl]);

const useParseIdToken = (id) => useMemo(() => (id ? parseJwt(id) : {}), [id]);

const useHandleSignOut = (onSignOut, handleClose, userId, handleGenericHttpErrors) => useCallback(
  (event) => {
    const proxyOnSignOut = isFunction(onSignOut) ? onSignOut : noop;
    if (userId) {
      API.use(API.endpoints.auth.signOut)
        .build(null, { user_id: userId })
        .send()
        .catch(handleGenericHttpErrors)
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
    handleGenericHttpErrors,
  ],
);

const useOnDelete = (
  handleSignOut,
  closeDeleteAccountDialog,
  userId,
  t,
  enqueueSnackbar,
  handleGenericHttpErrors,
) => useCallback(
  (event) => API.use(API.endpoints.user.delete)
    .build({ id: userId })
    .send()
    .then(() => {
      handleSignOut(event);

      const text = t('account.delete.success', 'Success !');
      enqueueSnackbar(text, { variant: 'success' });
    })
    .catch(handleGenericHttpErrors)
    .finally(closeDeleteAccountDialog),
  [
    handleSignOut,
    closeDeleteAccountDialog,
    userId,
    t,
    enqueueSnackbar,
    handleGenericHttpErrors,
  ],
);

// COMPONENTS
const ButtonConnectToken = ({
  AccountLink,
  className,
  classes,
  enqueueSnackbar,
  id,
  onSignOut,
  profile,
  t,
  token,
  customAction,
}) => {
  const internalClasses = useStyles();

  const classProps = useMemo(
    () => (isObject(classes) ? { classes } : { className }),
    [classes, className],
  );

  const [anchorEl, setAnchorEl] = useState(null);
  const [isOpenDeleteAccountDialog, setOpenDeleteAccountDialog] = useState(false);

  const handleGenericHttpErrors = useHandleGenericHttpErrors();
  const handleMenu = useHandleMenu(setAnchorEl);
  const handleClose = useHandleClose(setAnchorEl);

  const { sub: userId, acr } = useParseIdToken(id);
  const seclevel = useMemo(() => parseInt(acr, 10), [acr]);

  const handleEnqueueSnackbar = useMemo(
    () => (isFunction(enqueueSnackbar) ? enqueueSnackbar : noop),
    [enqueueSnackbar],
  );
  const handleSignOut = useHandleSignOut(onSignOut, handleClose, userId, handleGenericHttpErrors);

  const openDeleteAccountDialog = useCallback(() => {
    setOpenDeleteAccountDialog(true);
    handleClose();
  }, [handleClose, setOpenDeleteAccountDialog]);

  const closeDeleteAccountDialog = useCallback(() => {
    setOpenDeleteAccountDialog(false);
    handleClose();
  }, [handleClose, setOpenDeleteAccountDialog]);

  const iconButtonAction = useMemo(
    () => (isFunction(customAction) ? customAction : handleMenu),
    [customAction, handleMenu],
  );

  const onDelete = useOnDelete(
    handleSignOut,
    closeDeleteAccountDialog,
    userId,
    t,
    handleEnqueueSnackbar,
    handleGenericHttpErrors,
  );

  const open = useOpen(anchorEl);

  if (!token) { return null; }

  return (
    <>
      {profile && (
        <DeleteAccountDialog
          open={isOpenDeleteAccountDialog}
          onClose={closeDeleteAccountDialog}
          onSuccess={onDelete}
          profile={profile}
        />
      )}
      <IconButton
        aria-label={t('account.current', 'Account of current user')}
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={iconButtonAction}
        color="inherit"
        edge="end"
        {...classProps}
      >
        <ColorizedAvatar
          // FIXME: replace displayName by handle
          text={profile ? profile.displayName : ''}
          image={profile ? profile.avatarUri : ''}
        />
      </IconButton>
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
            {t('account.profile', 'My profile')}
          </MenuItem>
        )}
        {profile && seclevel > 1 && (
          <MenuItem
            button
            component="li"
            classes={{ root: internalClasses.deleteButton }}
            onClick={openDeleteAccountDialog}
          >
            {t('account.delete.label', 'Delete my account')}
          </MenuItem>
        )}
        <Divider light />
        <MenuItem button component="li" onClick={handleSignOut}>
          {t('account.signOut.label', 'Sign out')}
        </MenuItem>
      </Menu>
    </>
  );
};

ButtonConnectToken.propTypes = {
  // COMPONENT
  AccountLink: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),

  classes: PropTypes.object,
  className: PropTypes.string,
  customAction: PropTypes.func,
  enqueueSnackbar: PropTypes.func,
  // CALLBACKS
  id: PropTypes.string,

  onSignOut: PropTypes.func,
  profile: PropTypes.shape({
    avatarUri: PropTypes.string,
    displayName: PropTypes.string,
    email: PropTypes.string,
  }),
  t: PropTypes.func,
  token: PropTypes.string,
};

ButtonConnectToken.defaultProps = {
  AccountLink: Link,
  className: '',
  classes: null,
  enqueueSnackbar: null,
  id: null,
  onSignOut: null,
  profile: null,
  t: tDefault,
  token: null,
  customAction: null,
};

export default withTranslation()(ButtonConnectToken);
