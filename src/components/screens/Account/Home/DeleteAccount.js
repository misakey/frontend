import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import API from '@misakey/api';

import UserSchema from 'store/schemas/User';

import DeleteAccountDialog from '@misakey/ui/Dialog/Account/Delete';
import { signOut } from '@misakey/auth/store/actions/auth';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';


import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Typography from '@material-ui/core/Typography';

const useOnDelete = (
  handleSignOut,
  closeDeleteAccountDialog,
  userId,
  t,
  enqueueSnackbar,
) => useCallback(
  (event) => API.use(API.endpoints.user.delete)
    .build({ id: userId })
    .send()
    .then(() => {
      handleSignOut(event);

      const text = t('account.delete.success', 'Success !');
      enqueueSnackbar(text, { variant: 'success' });
    })
    .catch((e) => {
      const text = t(`httpStatus.error${API.errors.filter(e.httpStatus)}`);
      enqueueSnackbar(text, { variant: 'error' });
    })
    .finally(closeDeleteAccountDialog),
  [
    handleSignOut,
    closeDeleteAccountDialog,
    userId,
    t,
    enqueueSnackbar,
  ],
);


const useHandleSignOut = (onSignOut, userId, enqueueSnackbar, t) => useCallback(
  (event) => {
    if (userId) {
      API.use(API.endpoints.auth.signOut)
        .build(null, objectToSnakeCase({ userId }))
        .send()
        .catch((e) => {
          const text = t(`httpStatus.error.${API.errors.filter(e.httpStatus)}`);
          enqueueSnackbar(text, { variant: 'error' });
        })
        .finally(() => {
          onSignOut(event);
        });
    } else {
      onSignOut(event);
    }
  }, [
    onSignOut,
    userId,
    enqueueSnackbar,
    t,
  ],
);


// COMPONENTS
const DeleteAccount = ({ profile, t, onSignOut, seclevel, userId }) => {
  const [isOpenDeleteAccountDialog, setOpenDeleteAccountDialog] = useState(false);


  const enqueueSnackbar = useSnackbar();
  const handleSignOut = useHandleSignOut(onSignOut, userId, enqueueSnackbar, t);


  const openDeleteAccountDialog = useCallback(() => {
    setOpenDeleteAccountDialog(true);
  }, [setOpenDeleteAccountDialog]);

  const closeDeleteAccountDialog = useCallback(() => {
    setOpenDeleteAccountDialog(false);
  }, [setOpenDeleteAccountDialog]);


  const onDelete = useOnDelete(
    handleSignOut,
    closeDeleteAccountDialog,
    userId,
    t,
    enqueueSnackbar,
  );

  if (!profile && seclevel <= 1) {
    return null;
  }

  return (
    <>
      <DeleteAccountDialog
        open={isOpenDeleteAccountDialog}
        onClose={closeDeleteAccountDialog}
        onSuccess={onDelete}
        profile={profile}
      />
      <ListItem button aria-label={t('fields:deleteAccount.action')} onClick={openDeleteAccountDialog}>
        <ListItemIcon className="title">
          <Typography>{t('account.delete.title')}</Typography>
        </ListItemIcon>
        <ListItemText primary={t('account.delete.label')} />
        <ListItemSecondaryAction>
          <ChevronRightIcon className="icon" />
        </ListItemSecondaryAction>
      </ListItem>
    </>
  );
};

DeleteAccount.propTypes = {
  profile: PropTypes.shape(UserSchema.propTypes),
  userId: PropTypes.string.isRequired,
  seclevel: PropTypes.number.isRequired,
  t: PropTypes.func.isRequired,
  onSignOut: PropTypes.func.isRequired,
};

DeleteAccount.defaultProps = {
  profile: null,
};

// CONNECT
const mapStateToProps = (state) => ({
  userId: state.auth.userId,
  seclevel: state.auth.acr,

});

const mapDispatchToProps = (dispatch) => ({
  onSignOut: () => dispatch(signOut()),
});

export default connect(
  mapStateToProps, mapDispatchToProps,
)(withTranslation('screens')(DeleteAccount));
