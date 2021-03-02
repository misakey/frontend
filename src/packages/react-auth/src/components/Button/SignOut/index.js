import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omit from '@misakey/helpers/omit';

import { withUserManager } from '@misakey/react-auth/components/OidcProvider/Context';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

// CONSTANTS
const INTERNAL_PROPS = [
  'tReady',
  'i18n',
  'askSigninRedirect',
];

// COMPONENTS
const ButtonSignOut = ({ onSuccess, onLogout, t, ...props }) => {
  const onSignOut = useCallback(() => onLogout().then(onSuccess), [onLogout, onSuccess]);
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
  onSuccess: PropTypes.func,
  // withUserManager
  onLogout: PropTypes.func.isRequired,
};

ButtonSignOut.defaultProps = {
  standing: BUTTON_STANDINGS.CANCEL,
  onSuccess: null,
};

export default withTranslation('common')(withUserManager(ButtonSignOut));
