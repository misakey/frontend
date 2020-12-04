import PropTypes from 'prop-types';

import { PROP_TYPES as SSO_PROP_TYPES } from '@misakey/auth/store/reducers/sso';

import useRenewAuthStep from '@misakey/auth/hooks/useRenewAuthStep';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

// COMPONENTS
const ButtonRenewAuthStep = ({ loginChallenge, authnStep, ...props }) => {
  const onRenewAuthStep = useRenewAuthStep({ loginChallenge, ...authnStep });

  return (
    <Button
      standing={BUTTON_STANDINGS.TEXT}
      onClick={onRenewAuthStep}
      {...props}
    />
  );
};

ButtonRenewAuthStep.propTypes = {
  loginChallenge: PropTypes.string.isRequired,
  authnStep: PropTypes.shape(SSO_PROP_TYPES).isRequired,
};

export default ButtonRenewAuthStep;
