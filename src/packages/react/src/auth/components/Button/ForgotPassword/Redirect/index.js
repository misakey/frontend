import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import useOnResetPasswordRedirect from '@misakey/react/auth/hooks/useOnResetPasswordRedirect';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

// COMPONENTS
const ButtonForgotPasswordRedirect = ({ identifier, referrer, ...props }) => {
  const resetPasswordRedirectConfig = useMemo(
    () => ({
      loginHint: identifier,
      referrer,
    }),
    [identifier, referrer],
  );

  const onResetPasswordRedirect = useOnResetPasswordRedirect(resetPasswordRedirectConfig);

  return (
    <Button
      standing={BUTTON_STANDINGS.TEXT}
      onClick={onResetPasswordRedirect}
      {...props}
    />
  );
};

ButtonForgotPasswordRedirect.propTypes = {
  identifier: PropTypes.string.isRequired,
  referrer: PropTypes.string.isRequired,
};

export default ButtonForgotPasswordRedirect;
