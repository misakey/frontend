import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import { IDENTITY_EMAILED_CODE } from '@misakey/core/auth/constants/amr';

import { ssoSetMethodName } from '@misakey/react/auth/store/actions/sso';
import isNil from '@misakey/core/helpers/isNil';

import useOnResetPasswordRedirect from '@misakey/react/auth/hooks/useOnResetPasswordRedirect';
import useResetAuthHref from '@misakey/react/auth/hooks/useResetAuthHref';
import { useAuthCallbackHintsContext } from '@misakey/react/auth/components/Context/AuthCallbackHints';
import { useFormikContext } from 'formik';
import { useDispatch } from 'react-redux';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

// COMPONENTS
const ButtonForgotPassword = ({ loginChallenge, identifier, ...props }) => {
  const dispatch = useDispatch();

  const { resetForm } = useFormikContext();

  const { getCallbackHints, updateCallbackHints } = useAuthCallbackHintsContext();

  const authCallbackHints = useMemo(() => getCallbackHints(), [getCallbackHints]);

  const resetAuthHref = useResetAuthHref(loginChallenge);

  const resetPasswordRedirectConfig = useMemo(
    () => ({
      loginHint: identifier,
      referrer: resetAuthHref,
    }),
    [identifier, resetAuthHref],
  );

  const onResetPasswordRedirect = useOnResetPasswordRedirect(resetPasswordRedirectConfig);

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
};

export default ButtonForgotPassword;
