import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omit from '@misakey/core/helpers/omit';
import isFunction from '@misakey/core/helpers/isFunction';

import { withUserManager } from '@misakey/react-auth/components/OidcProvider/Context';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

// CONSTANTS
const INTERNAL_PROPS = [
  'tReady',
  'i18n',
  'askSigninRedirect',
];

// COMPONENTS
const ButtonSignOut = ({ onSuccess, onSignOut, onClick, t, ...props }) => {
  const handleClick = useCallback(
    (e) => {
      if (isFunction(onClick)) {
        onClick(e);
      }
      return onSignOut().then(onSuccess);
    }, [onClick, onSignOut, onSuccess],
  );
  return (
    <Button
      onClick={handleClick}
      text={t('common:signOut')}
      {...omit(props, INTERNAL_PROPS)}
    />
  );
};

ButtonSignOut.propTypes = {
  t: PropTypes.func.isRequired,
  standing: PropTypes.oneOf(Object.values(BUTTON_STANDINGS)),
  onSuccess: PropTypes.func,
  onClick: PropTypes.func,
  // withUserManager
  onSignOut: PropTypes.func.isRequired,
};

ButtonSignOut.defaultProps = {
  standing: BUTTON_STANDINGS.CANCEL,
  onSuccess: null,
  onClick: null,
};

export default withTranslation('common')(withUserManager(ButtonSignOut));
