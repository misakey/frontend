import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omit from '@misakey/helpers/omit';

import { withUserManager } from '@misakey/auth/components/OidcProvider/Context';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import useSignOut from '@misakey/auth/hooks/useSignOut';

// CONSTANTS
const INTERNAL_PROPS = [
  'tReady',
  'i18n',
  'askSigninRedirect',
];

// COMPONENTS
const ButtonSignOut = ({
  userManager, onSuccess,
  t, ...props
}) => {
  const onSignOut = useSignOut(userManager, onSuccess);

  return (
    <Button
      onClick={onSignOut}
      text={t('common:signOut')}
      {...omit(props, INTERNAL_PROPS)}
    />
  );
};

ButtonSignOut.propTypes = {
  t: PropTypes.func.isRequired,
  standing: PropTypes.oneOf(Object.values(BUTTON_STANDINGS)),
  // withUserManager
  userManager: PropTypes.object.isRequired,
  onSuccess: PropTypes.func,
};

ButtonSignOut.defaultProps = {
  standing: BUTTON_STANDINGS.CANCEL,
  onSuccess: null,
};

export default withTranslation('common')(withUserManager(ButtonSignOut));
