import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import isFunction from '@misakey/core/helpers/isFunction';

import { useUserManagerContext } from '@misakey/react/auth/components/OidcProvider/Context';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';


// COMPONENTS
const ButtonSignOut = ({ onSuccess, onClick, ...props }) => {
  const { t } = useTranslation('common');
  const { onSignOut } = useUserManagerContext();

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
      {...props}
    />
  );
};

ButtonSignOut.propTypes = {
  standing: PropTypes.oneOf(Object.values(BUTTON_STANDINGS)),
  onSuccess: PropTypes.func,
  onClick: PropTypes.func,
};

ButtonSignOut.defaultProps = {
  standing: BUTTON_STANDINGS.CANCEL,
  onSuccess: null,
  onClick: null,
};

export default ButtonSignOut;
