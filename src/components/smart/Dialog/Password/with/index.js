import React, { useState, useMemo, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';

import { PREHASHED_PASSWORD } from '@misakey/auth/constants/method';
import hardPasswordChange from '@misakey/crypto/store/actions/hardPasswordChange';
import { updateIdentity } from '@misakey/auth/store/actions/auth';
import { createPasswordValidationSchema, openVaultValidationSchema } from 'constants/validationSchemas/auth';

import isFunction from '@misakey/helpers/isFunction';
import isNil from '@misakey/helpers/isNil';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import { createAccount } from '@misakey/auth/builder/identities';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useLoadSecretsWithPassword from '@misakey/crypto/hooks/useLoadSecretsWithPassword';
import { selectors } from '@misakey/crypto/store/reducer';
import { setBackupVersion } from '@misakey/crypto/store/actions/concrete';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';

import DialogPassword from 'components/smart/Dialog/Password';

// COMPONENTS
const withDialogPassword = (Component) => {
  let Wrapper = ({
    onClick,
    dialogProps,
    t,
    ...props
  }, ref) => {
    const { enqueueSnackbar } = useSnackbar();
    const handleHttpErrors = useHandleHttpErrors();
    const dispatch = useDispatch();

    const dispatchHardPasswordChange = useCallback(
      (newPassword) => dispatch(hardPasswordChange(newPassword)),
      [dispatch],
    );

    const dispatchUpdateIdentity = useCallback(
      (newIdentity) => dispatch(updateIdentity(newIdentity)),
      [dispatch],
    );

    const [open, setOpen] = useState(false);

    const { accountId, id: identityId } = useSelector(getCurrentUserSelector) || {};

    const hasAccountId = useMemo(
      () => !isNil(accountId),
      [accountId],
    );

    const title = useMemo(
      () => (hasAccountId ? t('account:password.existing') : t('account:password.new')),
      [hasAccountId, t],
    );

    const formikProps = useMemo(
      () => (hasAccountId
        ? { validationSchema: openVaultValidationSchema }
        : { validationSchema: createPasswordValidationSchema }),
      [hasAccountId],
    );

    const isCryptoLoadedSelector = useMemo(
      () => selectors.isCryptoLoaded, [],
    );
    const isCryptoLoaded = useSelector(isCryptoLoadedSelector);

    const openVaultWithPassword = useLoadSecretsWithPassword();

    const onWrapperClick = useCallback(
      (...args) => {
        if (!hasAccountId || !isCryptoLoaded) {
          setOpen(true);
        } else if (isFunction(onClick)) {
          onClick(...args);
        }
      },
      [hasAccountId, isCryptoLoaded, onClick],
    );

    const onClose = useCallback(
      () => { setOpen(false); },
      [setOpen],
    );

    // @FIXME could be a prop to have a more generic component
    const onCreatePassword = useCallback(
      (password) => createAccount({
        password,
        identityId,
        dispatchHardPasswordChange,
      }).then((response) => {
        const { id, backupVersion } = objectToCamelCase(response);
        return Promise.all([
          dispatchUpdateIdentity({ accountId: id }),
          dispatch(setBackupVersion(backupVersion)),
        ]);
      }),
      [dispatch, dispatchHardPasswordChange, dispatchUpdateIdentity, identityId],
    );

    const handleSubmit = useCallback(
      (password) => {
        if (hasAccountId) {
          return openVaultWithPassword(password);
        }
        return onCreatePassword(password)
          .then(() => {
            const text = t('account:password.success');
            enqueueSnackbar(text, { variant: 'success' });
            if (isFunction(onClick)) { onClick(); }
          })
          .catch(handleHttpErrors);
      },
      [hasAccountId, onCreatePassword, handleHttpErrors,
        openVaultWithPassword, t, enqueueSnackbar, onClick],
    );

    const onSubmit = useCallback(
      ({ [PREHASHED_PASSWORD]: password }) => handleSubmit(password)
        .then(() => {
          if (isFunction(onClick)) { onClick(); }
          onClose();
        }),
      [handleSubmit, onClose, onClick],
    );

    return (
      <>
        <DialogPassword
          title={title}
          open={open}
          onClose={onClose}
          onSubmit={onSubmit}
          formikProps={formikProps}
          {...dialogProps}
        />
        <Component ref={ref} onClick={onWrapperClick} {...omitTranslationProps(props)} />
      </>
    );
  };

  Wrapper = forwardRef(Wrapper);

  Wrapper.propTypes = {
    onClick: PropTypes.func,
    dialogProps: PropTypes.shape({
      onClose: PropTypes.func,
      onSubmit: PropTypes.func,
      open: PropTypes.bool,
    }),
    // withTranslation
    t: PropTypes.func.isRequired,
  };

  Wrapper.defaultProps = {
    onClick: null,
    dialogProps: {},
  };

  return withTranslation('account')(Wrapper);
};

export default withDialogPassword;
