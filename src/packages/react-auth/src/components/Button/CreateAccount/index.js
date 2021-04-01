import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import isFunction from '@misakey/core/helpers/isFunction';

import useCreateAccount from '@misakey/react-auth/hooks/useCreateAccount';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

// COMPONENTS
const ButtonCreateAccount = ({ onClick, ...props }) => {
  const onCreateAccount = useCreateAccount();

  const handleClick = useCallback(
    (e) => {
      if (isFunction(onClick)) {
        onClick(e);
      }
      onCreateAccount(e);
    },
    [onClick, onCreateAccount],
  );

  return (
    <Button
      standing={BUTTON_STANDINGS.MAIN}
      onClick={handleClick}
      {...props}
    />
  );
};

ButtonCreateAccount.propTypes = {
  text: PropTypes.node.isRequired,
  onClick: PropTypes.func,
};

ButtonCreateAccount.defaultProps = {
  onClick: null,
};

export default ButtonCreateAccount;
