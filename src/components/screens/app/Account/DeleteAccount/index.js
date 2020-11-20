import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import API from '@misakey/api';

import IdentitySchema from 'store/schemas/Identity';

import DeleteAccountDialog from 'components/dumb/Dialog/Account/Delete';
import { signOut } from '@misakey/auth/store/actions/auth';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import { withUserManager } from '@misakey/auth/components/OidcProvider/Context';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

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
  handleHttpErrors,
) => useCallback(
  (event) => API.use(API.endpoints.user.delete)
    .build({ id: userId })
    .send()
    .then(() => {
      handleSignOut(event);

      const text = t('account:delete.success', 'Success !');
      enqueueSnackbar(text, { variant: 'success' });
    })
    .catch(handleHttpErrors)
    .finally(closeDeleteAccountDialog),
  [userId, handleHttpErrors, closeDeleteAccountDialog, handleSignOut, t, enqueueSnackbar],
);


const useHandleSignOut = (onSignOut, userId, handleHttpErrors, userManager) => useCallback(
  (event) => {
    if (userId) {
      API.use(API.endpoints.auth.signOut)
        .build(null, objectToSnakeCase({ userId }))
        .send()
        .catch(handleHttpErrors)
        .finally(() => {
          userManager.removeUser().then(() => {
            onSignOut(event);
          });
        });
    } else {
      onSignOut(event);
    }
  }, [userId, handleHttpErrors, userManager, onSignOut],
);

// @FIXME not used yet, could be reused when user account deletion

// COMPONENTS
const DeleteAccount = ({ identity, t, onSignOut, seclevel, userId, userManager, classes }) => {
  const [isOpenDeleteAccountDialog, setOpenDeleteAccountDialog] = useState(false);

  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();
  const handleSignOut = useHandleSignOut(onSignOut, userId, handleHttpErrors, userManager);

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
    handleHttpErrors,
  );

  if (!identity && seclevel <= 1) {
    return null;
  }

  return (
    <>
      <DeleteAccountDialog
        open={isOpenDeleteAccountDialog}
        onClose={closeDeleteAccountDialog}
        onSuccess={onDelete}
        identity={identity}
      />
      <ListItem button aria-label={t('account:delete.label')} onClick={openDeleteAccountDialog}>
        <ListItemIcon className={classes.listItemIcon}>
          <Typography>{t('account:delete.title')}</Typography>
        </ListItemIcon>
        <ListItemText primary={t('account:delete.label')} />
        <ListItemSecondaryAction>
          <ChevronRightIcon className={classes.actionIcon} />
        </ListItemSecondaryAction>
      </ListItem>
    </>
  );
};

DeleteAccount.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes),
  userId: PropTypes.string.isRequired,
  seclevel: PropTypes.number.isRequired,
  t: PropTypes.func.isRequired,
  onSignOut: PropTypes.func.isRequired,
  userManager: PropTypes.object.isRequired,
  classes: PropTypes.object,
};

DeleteAccount.defaultProps = {
  identity: null,
  classes: {},
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
)(withTranslation(['account'])(withUserManager(DeleteAccount)));
