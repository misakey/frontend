import React, { useCallback, useContext, useMemo } from 'react';
import { useFormikContext } from 'formik';
import PropTypes from 'prop-types';

import { useDispatch } from 'react-redux';

import { ssoSetMethodName } from '@misakey/react/auth/store/actions/sso';
import isNil from '@misakey/core/helpers/isNil';

import useResetAuthHref from '@misakey/react/auth/hooks/useResetAuthHref';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import { IDENTITY_EMAILED_CODE } from '@misakey/core/auth/constants/amr';
import { useAuthCallbackHintsContext } from '@misakey/react/auth/components/Context/AuthCallbackHints';
import { UserManagerContext } from '../../OidcProvider/Context';

// COMPONENTS
const ButtonForgotPassword = ({ loginChallenge, identifier, ...props }) => {
  const dispatch = useDispatch();

  const { resetForm } = useFormikContext();

  const { userManager } = useContext(UserManagerContext);

  const { getCallbackHints, updateCallbackHints } = useAuthCallbackHintsContext();

  const authCallbackHints = useMemo(() => getCallbackHints(), [getCallbackHints]);

  const resetAuthHref = useResetAuthHref(loginChallenge);

  const onResetPasswordRedirect = useCallback(
    () => {
      userManager.signinRedirect({
        loginHint: identifier,
        misakeyCallbackHints: { resetPassword: true },
        referrer: resetAuthHref,
      });
    },
    [identifier, resetAuthHref, userManager],
  );

  const onResetPassword = useCallback(
    async () => {
      await updateCallbackHints({ resetPassword: true });
      dispatch(ssoSetMethodName(IDENTITY_EMAILED_CODE));
      resetForm();
    },
    [dispatch, resetForm, updateCallbackHints],
  );

  const onClick = useMemo(
    // if hints are not found, app will not be able to read it at
    // the end of the flow so it's pointless to add instructions in it.
    // Fallback is to launch a new auth flow for user to perform
    // the reset password on Misakey with a referrer that allow them to come back
    // and finish their current flow.
    // It can happen for example if current flow is a consent flow launched from an integrator.
    () => (isNil(authCallbackHints) ? onResetPasswordRedirect : onResetPassword),
    [authCallbackHints, onResetPassword, onResetPasswordRedirect],
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
  isFormDisabled: PropTypes.bool.isRequired,
  toggleIsFormDisabled: PropTypes.func.isRequired,
};

export default ButtonForgotPassword;
