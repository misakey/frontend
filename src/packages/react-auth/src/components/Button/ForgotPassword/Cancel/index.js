import React, { useCallback } from 'react';

import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { ssoUpdate } from '@misakey/react-auth/store/actions/sso';

import updateAuthIdentities from '@misakey/core/auth/builder/updateAuthIdentities';
import isFunction from '@misakey/core/helpers/isFunction';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

// COMPONENTS
const ButtonForgotPasswordCancel = ({ loginChallenge, identifier, onClick, ...props }) => {
  const handleHttpErrors = useHandleHttpErrors();
  const dispatch = useDispatch();

  const handleClick = useCallback(
    async () => {
      try {
        const { identity, authnStep } = await updateAuthIdentities({
          loginChallenge,
          identifierValue: identifier,
          passwordReset: false,
        });
        dispatch(ssoUpdate({ identity, authnStep }));
        if (isFunction(onClick)) {
          onClick();
        }
      } catch (e) {
        handleHttpErrors(e);
      }
    },
    [dispatch, handleHttpErrors, identifier, loginChallenge, onClick],
  );

  return (
    <Button
      standing={BUTTON_STANDINGS.CANCEL}
      onClick={handleClick}
      {...props}
    />
  );
};

ButtonForgotPasswordCancel.propTypes = {
  loginChallenge: PropTypes.string.isRequired,
  identifier: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

ButtonForgotPasswordCancel.defaultProps = {
  onClick: null,
};

export default ButtonForgotPasswordCancel;
