import React, { useMemo, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';

import hardPasswordChange from '@misakey/crypto/store/actions/hardPasswordChange';
import { updateIdentity } from '@misakey/auth/store/actions/auth';
import IdentitySchema from 'store/schemas/Identity';
import { createPasswordValidationSchema } from 'constants/validationSchemas/auth';
import { PREHASHED_PASSWORD } from '@misakey/auth/constants/method';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import isFunction from '@misakey/helpers/isFunction';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import { createAccount } from '@misakey/auth/builder/identities';
import { setBackupVersion } from '@misakey/crypto/store/actions/concrete';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

import withIdentity from 'components/smart/withIdentity';
import DialogPassword from 'components/smart/Dialog/Password';

const DialogPasswordCreate = forwardRef(({
  onClose,
  onSuccess,
  identityId,
  t,
  ...props
}, ref) => {
  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();
  const dispatch = useDispatch();

  const formikProps = useMemo(
    () => ({ validationSchema: createPasswordValidationSchema }),
    [],
  );

  const dispatchHardPasswordChange = useCallback(
    (newPassword) => dispatch(hardPasswordChange(newPassword)),
    [dispatch],
  );
  const dispatchUpdateIdentity = useCallback(
    (identity) => dispatch(updateIdentity(identity)),
    [dispatch],
  );

  const onPasswordSubmit = useCallback(
    (password) => createAccount({
      password,
      identityId,
      dispatchHardPasswordChange,
    }).then((response) => {
      const { id, backupVersion } = objectToCamelCase(response);
      return Promise.resolve([
        dispatchUpdateIdentity({ accountId: id }),
        dispatch(setBackupVersion(backupVersion)),
      ]);
    }),
    [dispatch, dispatchHardPasswordChange, dispatchUpdateIdentity, identityId],
  );

  const onSubmit = useCallback(
    ({ [PREHASHED_PASSWORD]: password }) => onPasswordSubmit(password)
      .then(() => {
        const text = t('account:password.success');
        enqueueSnackbar(text, { variant: 'success' });
        if (isFunction(onSuccess)) {
          onSuccess();
        }
      })
      .catch(handleHttpErrors)
      .finally(onClose),
    [enqueueSnackbar, handleHttpErrors, onClose, onPasswordSubmit, onSuccess, t],
  );

  return (
    <DialogPassword
      ref={ref}
      title={t('account:password.new')}
      onClose={onClose}
      onSubmit={onSubmit}
      formikProps={formikProps}
      {...omitTranslationProps(props)}
    />
  );
});

DialogPasswordCreate.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
  // withTranslation
  t: PropTypes.func.isRequired,
  // withIdentity
  identity: PropTypes.shape(IdentitySchema.propTypes),
  identityId: PropTypes.string,
};

DialogPasswordCreate.defaultProps = {
  open: false,
  onSuccess: null,
  identity: null,
  identityId: null,
};

export default withIdentity(withTranslation('account')(DialogPasswordCreate));

