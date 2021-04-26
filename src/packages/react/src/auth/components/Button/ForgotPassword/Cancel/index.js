import React, { useCallback } from 'react';
import { useFormikContext } from 'formik';

import { useDispatch } from 'react-redux';

import { ssoSetMethodName } from '@misakey/react/auth/store/actions/sso';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import { IDENTITY_PASSWORD } from '@misakey/core/auth/constants/amr';
import { useAuthCallbackHintsContext } from '@misakey/react/auth/components/Context/AuthCallbackHints';

// COMPONENTS
const ButtonForgotPasswordCancel = (props) => {
  const dispatch = useDispatch();

  const { resetForm } = useFormikContext();

  const { updateCallbackHints } = useAuthCallbackHintsContext();

  const onClick = useCallback(
    async () => {
      await updateCallbackHints({ resetPassword: false });
      dispatch(ssoSetMethodName(IDENTITY_PASSWORD));
      resetForm();
    },
    [dispatch, resetForm, updateCallbackHints],
  );

  return (
    <Button
      standing={BUTTON_STANDINGS.TEXT}
      onClick={onClick}
      {...props}
    />
  );
};

export default ButtonForgotPasswordCancel;
