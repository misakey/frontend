import React, { useCallback, useMemo } from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useFormikContext } from 'formik';

import { ssoUpdate } from '@misakey/react-auth/store/actions/sso';

import camelCase from '@misakey/helpers/camelCase';
import { TOTP, TOTP_RECOVERY } from '@misakey/auth/constants/method';
import { PROP_TYPES as SSO_PROP_TYPES } from '@misakey/react-auth/store/reducers/sso';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import { useTranslation } from 'react-i18next';

// COMPONENTS
const ButtonSwitchTotpMethod = ({ authnStep, dispatchSsoUpdate, ...props }) => {
  const { t } = useTranslation('account');
  const { resetForm } = useFormikContext();

  const { methodName } = useMemo(() => authnStep, [authnStep]);

  const targetMethod = useMemo(() => (methodName === TOTP ? TOTP_RECOVERY : TOTP), [methodName]);

  const text = useMemo(() => t(`auth:login.form.action.${camelCase(targetMethod)}`), [targetMethod, t]);

  const onClick = useCallback(
    () => {
      dispatchSsoUpdate({
        authnStep: { ...authnStep, methodName: targetMethod },
      });
      resetForm();
    },
    [authnStep, dispatchSsoUpdate, resetForm, targetMethod],
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
  authnStep: PropTypes.shape(SSO_PROP_TYPES).isRequired,
  // CONNECT
  dispatchSsoUpdate: PropTypes.func.isRequired,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchSsoUpdate: (sso) => dispatch(ssoUpdate(sso)),
});

export default connect(null, mapDispatchToProps)(ButtonSwitchTotpMethod);
