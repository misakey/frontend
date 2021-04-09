import React, { useCallback } from 'react';
import { useFormikContext } from 'formik';

import { useDispatch } from 'react-redux';

import { ssoSetMethodName } from '@misakey/react/auth/store/actions/sso';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import { IDENTITY_PASSWORD } from '@misakey/core/auth/constants/amr';
import { useUserManagerContext } from '@misakey/react/auth/components/OidcProvider/Context';
import useGetAskedAuthState from '@misakey/react/auth/hooks/useGetAskedAuthState';

// COMPONENTS
const ButtonForgotPasswordCancel = (props) => {
  const dispatch = useDispatch();

  const { resetForm } = useFormikContext();

  const { userManager } = useUserManagerContext();

  const { state, stateId } = useGetAskedAuthState();

  const onClick = useCallback(
    async () => {
      await userManager.storeState(stateId, { ...state, resetPassword: false });
      dispatch(ssoSetMethodName(IDENTITY_PASSWORD));
      resetForm();
    },
    [dispatch, resetForm, state, stateId, userManager],
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
