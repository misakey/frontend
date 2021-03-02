import React, { useContext, useCallback } from 'react';

import PropTypes from 'prop-types';

import { UserManagerContext } from '@misakey/react-auth/components/OidcProvider/Context';

import { useTranslation } from 'react-i18next';
import useXsMediaQuery from '@misakey/hooks/useXsMediaQuery';

import CardUserAuth from '@misakey/react-auth/components/Card/User';
import IconButton from '@material-ui/core/IconButton';

import CloseIcon from '@material-ui/icons/Close';

const CardUserSignOut = ({ onSuccess, component: Component, ...props }) => {
  const { t } = useTranslation('common');

  const isXs = useXsMediaQuery();

  const { onLogout } = useContext(UserManagerContext);
  const onSignOut = useCallback(
    () => onLogout().then(onSuccess),
    [onLogout, onSuccess],
  );

  return (
    <Component
      action={(
        <IconButton size={isXs ? 'small' : undefined} aria-label={t('common:signOut')} onClick={onSignOut}>
          <CloseIcon />
        </IconButton>
      )}
      {...props}
    />
  );
};

CardUserSignOut.propTypes = {
  component: PropTypes.elementType,
  onSuccess: PropTypes.func,
};

CardUserSignOut.defaultProps = {
  component: CardUserAuth,
  onSuccess: null,
};

export default CardUserSignOut;
