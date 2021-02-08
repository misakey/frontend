import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useDispatch } from 'react-redux';

import Subtitle from '@misakey/ui/Typography/Subtitle';
import List from '@material-ui/core/List';
import DialogConfirm from '@misakey/ui/Dialog/Confirm';
import Typography from '@material-ui/core/Typography';

import IdentitySchema from 'store/schemas/Identity';
import { userIdentityUpdate } from 'store/actions/screens/account';

import { updateIdentity } from '@misakey/helpers/builder/identities';

import { DISABLED } from 'constants/account/mfaMethod';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

import ListItemWebauthn from './Webauthn';
import ListItemTotp from './TOTP';

// COMPONENTS
const AccountMFA = ({ identity, setIsFetching }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation(['account', 'common']);
  const handleHttpErrors = useHandleHttpErrors();
  const dispatch = useDispatch();

  const { id: identityId, mfaMethod } = useSafeDestr(identity);
  const [isConfirmChangeDialogOpened, setIsConfirmChangeDialogOpened] = useState(false);
  const [pendingNewMFAMethod, setPendingNewMFAMethod] = useState(null);

  const onChangeMFAMethod = useCallback(
    async (newMfaMethod = pendingNewMFAMethod) => {
      try {
        setIsFetching(true);
        await updateIdentity({
          id: identityId,
          mfaMethod: newMfaMethod,
        });
        enqueueSnackbar(t('account:security.MFA.updateMethod.success'), { variant: 'success' });
        dispatch(userIdentityUpdate(identityId, { mfaMethod: newMfaMethod }));
      } catch (error) {
        handleHttpErrors(error);
      } finally {
        setIsFetching(false);
      }
    },
    [dispatch, enqueueSnackbar, handleHttpErrors,
      identityId, pendingNewMFAMethod, setIsFetching, t],
  );

  const onConfirmChangeMFAMethod = useCallback(
    (newMfaMethod) => {
      if (mfaMethod !== DISABLED && newMfaMethod !== DISABLED) {
        setPendingNewMFAMethod(newMfaMethod);
        return setIsConfirmChangeDialogOpened(true);
      }
      return onChangeMFAMethod(newMfaMethod);
    },
    [mfaMethod, onChangeMFAMethod],
  );

  const onCloseConfirmChangeMFAMethod = useCallback(
    () => {
      setIsConfirmChangeDialogOpened(false);
    },
    [],
  );

  return (
    <>
      <Subtitle>{t('account:security.MFA.description')}</Subtitle>
      <List>
        <ListItemTotp identity={identity} onChangeMFAMethod={onConfirmChangeMFAMethod} />
        <ListItemWebauthn identity={identity} onChangeMFAMethod={onConfirmChangeMFAMethod} />
      </List>
      <DialogConfirm
        onConfirm={onChangeMFAMethod}
        isDialogOpen={isConfirmChangeDialogOpened}
        onClose={onCloseConfirmChangeMFAMethod}
        confirmButtonText={t('common:validate')}
        title={t('account:security.MFA.updateMethod.confirm.title')}
      >
        <Typography color="textSecondary">
          {t('account:security.MFA.updateMethod.confirm.subtitle')}
        </Typography>
      </DialogConfirm>
    </>
  );
};

AccountMFA.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes),
  setIsFetching: PropTypes.func.isRequired,
};

AccountMFA.defaultProps = {
  identity: null,
};

export default AccountMFA;
