import React from 'react';
import PropTypes from 'prop-types';

import useInitAuthStep from '@misakey/react/auth/hooks/useInitAuthStep';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import { PROP_TYPES } from '@misakey/react/auth/store/reducers/sso';

// COMPONENTS
const ButtonInitAuthStep = ({ loginChallenge, identityId, methodName, successText, ...props }) => {
  const onInitAuthStep = useInitAuthStep(
    { loginChallenge, identityId, methodName },
    { successText },
  );

  return (
    <Button
      standing={BUTTON_STANDINGS.TEXT}
      onClick={onInitAuthStep}
      {...props}
    />
  );
};

ButtonInitAuthStep.propTypes = {
  loginChallenge: PropTypes.string.isRequired,
  identityId: PropTypes.string.isRequired,
  methodName: PROP_TYPES.methodName.isRequired,
  successText: PropTypes.string,
};

ButtonInitAuthStep.defaultProps = {
  successText: null,
};

export default ButtonInitAuthStep;
