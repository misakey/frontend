import React, { useCallback } from 'react';

import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { ssoUpdate } from '@misakey/react-auth/store/actions/sso';

import updateAuthIdentities from '@misakey/auth/builder/updateAuthIdentities';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

// COMPONENTS
const ButtonForgotPassword = ({ loginChallenge, identifier, dispatchSsoUpdate, ...props }) => {
  const handleHttpErrors = useHandleHttpErrors();

  const onClick = useCallback(
    () => updateAuthIdentities({ loginChallenge, identifierValue: identifier, passwordReset: true })
      .then(({ identity, authnStep }) => dispatchSsoUpdate({ identity, authnStep }))
      .catch(handleHttpErrors),
    [dispatchSsoUpdate, handleHttpErrors, identifier, loginChallenge],
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
  // CONNECT
  dispatchSsoUpdate: PropTypes.func.isRequired,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchSsoUpdate: (sso) => dispatch(ssoUpdate(sso)),
});

export default connect(null, mapDispatchToProps)(ButtonForgotPassword);
