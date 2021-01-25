import React from 'react';
import PropTypes from 'prop-types';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import useCreateAccount from '@misakey/auth/hooks/useCreateAccount';

// COMPONENTS
const ButtonCreateAccount = (props) => {
  const onCreateAccount = useCreateAccount();

  return (
    <Button
      standing={BUTTON_STANDINGS.MAIN}
      onClick={onCreateAccount}
      {...props}
    />
  );
};

ButtonCreateAccount.propTypes = {
  text: PropTypes.node.isRequired,
};

export default ButtonCreateAccount;
