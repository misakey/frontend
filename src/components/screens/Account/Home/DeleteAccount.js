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
import { withUserManager } from '@misakey/auth/components/OidcProvider';
import useHandleGenericHttpErrors from 'hooks/useHandleGenericHttpErrors';

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
  handleGenericHttpErrors,
) => useCallback(
  (event) => API.use(API.endpoints.user.delete)
    .build({ id: userId })
    .send()
    .then(() => {
      handleSignOut(event);

      const text = t('screens:account.delete.success', 'Success !');
      enqueueSnackbar(text, { variant: 'success' });
    })
    .catch(handleGenericHttpErrors)
    .finally(closeDeleteAccountDialog),
  [userId, handleGenericHttpErrors, closeDeleteAccountDialog, handleSignOut, t, enqueueSnackbar],
);


const useHandleSignOut = (onSignOut, userId, handleGenericHttpErrors, userManager) => useCallback(
  (event) => {
    if (userId) {
      API.use(API.endpoints.auth.signOut)
        .build(null, objectToSnakeCase({ userId }))
        .send()
        .catch(handleGenericHttpErrors)
        .finally(() => {
          userManager.removeUser().then(() => {
            onSignOut(event);
          });
        });
    } else {
      onSignOut(event);
    }
  }, [userId, handleGenericHttpErrors, userManager, onSignOut],
);


// COMPONENTS
const DeleteAccount = ({ profile, t, onSignOut, seclevel, userId, userManager }) => {
  const [isOpenDeleteAccountDialog, setOpenDeleteAccountDialog] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const handleGenericHttpErrors = useHandleGenericHttpErrors();
  const handleSignOut = useHandleSignOut(onSignOut, userId, handleGenericHttpErrors, userManager);

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
    handleGenericHttpErrors,
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
          <Typography>{t('screens:account.delete.title')}</Typography>
        </ListItemIcon>
        <ListItemText primary={t('screens:account.delete.label')} />
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
  userManager: PropTypes.object.isRequired,
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
)(withTranslation(['screens', 'fields'])(withUserManager(DeleteAccount)));
