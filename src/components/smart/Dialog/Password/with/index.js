import React, { useState, useMemo, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';
import { usePasswordPrompt, PasswordPromptProvider } from 'components/dumb/PasswordPrompt';

import hardPasswordChange from '@misakey/crypto/store/actions/hardPasswordChange';
import { updateIdentity } from '@misakey/auth/store/actions/auth';
import IdentitySchema from 'store/schemas/Identity';
import ensureSecretsLoaded from '@misakey/crypto/store/actions/ensureSecretsLoaded';

import isFunction from '@misakey/helpers/isFunction';
import isNil from '@misakey/helpers/isNil';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import { createAccount } from '@misakey/auth/builder/identities';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

import DialogPassword from 'components/smart/Dialog/Password';
import withIdentity from 'components/smart/withIdentity';

// COMPONENTS
const withDialogPassword = (Component) => {
  let Wrapper = ({
    onClick,
    identity,
    identityId,
    dialogProps,
    dispatchHardPasswordChange,
    dispatchUpdateIdentity,
    t,
    ...props
  }, ref) => {
    const { enqueueSnackbar } = useSnackbar();
    const handleHttpErrors = useHandleHttpErrors();
    const dispatch = useDispatch();

    const [open, setOpen] = useState(false);
    const openPasswordPrompt = usePasswordPrompt();

    const { accountId } = useMemo(
      () => identity || {},
      [identity],
    );

    const hasAccountId = useMemo(
      () => !isNil(accountId),
      [accountId],
    );

    const initCrypto = useCallback(
      () => dispatch(ensureSecretsLoaded({ openPasswordPrompt })),
      [dispatch, openPasswordPrompt],
    );

    const onWrapperClick = useCallback(
      (...args) => {
        if (!hasAccountId) {
          setOpen(true);
        } else {
          initCrypto();
        }
        if (isFunction(onClick)) {
          onClick(...args);
        }
      },
      [hasAccountId, initCrypto, onClick],
    );

    const onClose = useCallback(
      () => { setOpen(false); },
      [setOpen],
    );

    const onPasswordSubmit = useCallback(
      (password) => createAccount({
        password,
        identityId,
        dispatchHardPasswordChange,
      }).then((response) => {
        const { id } = objectToCamelCase(response);
        return dispatchUpdateIdentity({ accountId: id });
      }),
      [dispatchHardPasswordChange, dispatchUpdateIdentity, identityId],
    );

    const onSubmit = useCallback(
      ({ password }) => onPasswordSubmit(password)
        .then(() => {
          const text = t('account:password.success');
          enqueueSnackbar(text, { variant: 'success' });
        })
        .catch(handleHttpErrors)
        .finally(onClose),
      [enqueueSnackbar, handleHttpErrors, onClose, onPasswordSubmit, t],
    );

    return (
      <>
        <DialogPassword
          title={t('account:password.new')}
          open={open}
          onClose={onClose}
          onSubmit={onSubmit}
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
    // withIdentity
    identity: PropTypes.shape(IdentitySchema.propTypes),
    identityId: PropTypes.string,
    // CONNECT
    dispatchHardPasswordChange: PropTypes.func.isRequired,
    dispatchUpdateIdentity: PropTypes.func.isRequired,
  };

  Wrapper.defaultProps = {
    onClick: null,
    identity: null,
    identityId: null,
    dialogProps: {},
  };

  Wrapper = withIdentity(Wrapper);

  // CONNECT
  const mapDispatchToProps = (dispatch) => ({
    dispatchHardPasswordChange: (newPassword) => dispatch(hardPasswordChange(newPassword)),
    dispatchUpdateIdentity: (identity) => dispatch(updateIdentity(identity)),
  });

  Wrapper = connect(null, mapDispatchToProps, null, { forwardRef: true })(withTranslation('account')(Wrapper));

  return ({ ...props }) => (
    <PasswordPromptProvider>
      <Wrapper {...props} />
    </PasswordPromptProvider>
  );
};

export default withDialogPassword;
