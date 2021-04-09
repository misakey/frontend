import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import isFunction from '@misakey/core/helpers/isFunction';

import useAskToSetPassword from '@misakey/react/auth/hooks/useAskToSetPassword';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

// COMPONENTS
const ButtonCreatePassword = ({ onClick, ...props }) => {
  const askToSetPassword = useAskToSetPassword();

  const handleClick = useCallback(
    (e) => {
      if (isFunction(onClick)) {
        onClick(e);
      }
      askToSetPassword(e);
    },
    [onClick, askToSetPassword],
  );

  return (
    <Button
      standing={BUTTON_STANDINGS.MAIN}
      onClick={handleClick}
      {...props}
    />
  );
};

ButtonCreatePassword.propTypes = {
  text: PropTypes.node.isRequired,
  onClick: PropTypes.func,
};

ButtonCreatePassword.defaultProps = {
  onClick: null,
};

export default ButtonCreatePassword;
