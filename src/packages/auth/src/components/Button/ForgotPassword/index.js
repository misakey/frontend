import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useFormikContext } from 'formik';

import { EMAILED_CODE } from '@misakey/auth/constants/method';
import { ssoUpdate } from '@misakey/auth/store/actions/sso';

import { requireAuthable } from '@misakey/auth/builder/identities';
import isFunction from '@misakey/helpers/isFunction';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useRenewAuthStep from '@misakey/auth/hooks/useRenewAuthStep';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

// COMPONENTS
const ButtonForgotPassword = ({
  loginChallenge, identifier,
  onDone,
  dispatchSsoUpdate,
  ...props }) => {
  const handleHttpErrors = useHandleHttpErrors();

  const { resetForm } = useFormikContext();

  const onRenewAuthStep = useRenewAuthStep({ loginChallenge });

  const onClick = useCallback(
    () => requireAuthable(loginChallenge, identifier)
      .then(({ identity, authnStep }) => {
        const nextAuthnStep = { ...authnStep, methodName: EMAILED_CODE };
        dispatchSsoUpdate({ identity, authnStep: nextAuthnStep });
        return onRenewAuthStep(nextAuthnStep);
      })
      .then(() => {
        resetForm();
        if (isFunction(onDone)) {
          onDone();
        }
      })
      .catch(handleHttpErrors),
    [
      dispatchSsoUpdate, handleHttpErrors,
      identifier, loginChallenge,
      onDone, onRenewAuthStep,
      resetForm,
    ],
  );

  return (
    <Button
      standing={BUTTON_STANDINGS.TEXT}
      onClick={onClick}
      {...props}
    />
  );
};

ButtonForgotPassword.propTypes = {
  loginChallenge: PropTypes.string.isRequired,
  identifier: PropTypes.string.isRequired,
  onDone: PropTypes.func,
  // CONNECT
  dispatchSsoUpdate: PropTypes.func.isRequired,
};

ButtonForgotPassword.defaultProps = {
  onDone: null,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchSsoUpdate: (sso) => dispatch(ssoUpdate(sso)),
});

export default connect(null, mapDispatchToProps)(ButtonForgotPassword);
