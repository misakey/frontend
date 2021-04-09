import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useDispatch } from 'react-redux';
import { useFormikContext } from 'formik';

import { ssoSetMethodName } from '@misakey/react/auth/store/actions/sso';

import camelCase from '@misakey/core/helpers/camelCase';
import { PROP_TYPES } from '@misakey/react/auth/store/reducers/sso';
import { TOTP, TOTP_RECOVERY } from '@misakey/core/auth/constants/amr';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

// COMPONENTS
const ButtonSwitchTotpMethod = ({ methodName, ...props }) => {
  const { t } = useTranslation('auth');
  const { resetForm } = useFormikContext();
  const dispatch = useDispatch();

  const targetMethod = useMemo(
    () => (methodName === TOTP ? TOTP_RECOVERY : TOTP),
    [methodName],
  );

  const text = useMemo(() => t(`auth:login.form.action.${camelCase(targetMethod)}`), [targetMethod, t]);

  const onClick = useCallback(
    () => {
      dispatch(ssoSetMethodName(targetMethod));
      resetForm();
    },
    [dispatch, resetForm, targetMethod],
  );

  return (
    <Button
      standing={BUTTON_STANDINGS.TEXT}
      onClick={onClick}
      text={text}
      {...props}
    />
  );
};

ButtonSwitchTotpMethod.propTypes = {
  methodName: PROP_TYPES.methodName.isRequired,
};

export default ButtonSwitchTotpMethod;
