import React, { useCallback, useContext } from 'react';
import { useFormikContext } from 'formik';

import { useDispatch } from 'react-redux';

import { ssoSetMethodName } from '@misakey/react/auth/store/actions/sso';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import { IDENTITY_EMAILED_CODE } from '@misakey/core/auth/constants/amr';
import { UserManagerContext } from '../../OidcProvider/Context';
import useGetAskedAuthState from '../../../hooks/useGetAskedAuthState';

// COMPONENTS
const ButtonForgotPassword = (props) => {
  const dispatch = useDispatch();

  const { resetForm } = useFormikContext();

  const { userManager } = useContext(UserManagerContext);

  const { state, stateId } = useGetAskedAuthState();

  const onClick = useCallback(
    async () => {
      await userManager.storeState(stateId, { ...state, resetPassword: true });
      dispatch(ssoSetMethodName(IDENTITY_EMAILED_CODE));
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

export default ButtonForgotPassword;
