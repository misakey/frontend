import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { UserManagerContext } from '@misakey/auth/components/OidcProvider/Context';

import useSignOut from '@misakey/auth/hooks/useSignOut';
import { useTranslation } from 'react-i18next';
import useXsMediaQuery from '@misakey/hooks/useXsMediaQuery';

import CardUserAuth from '@misakey/auth/components/Card/User';
import IconButton from '@material-ui/core/IconButton';

import CloseIcon from '@material-ui/icons/Close';

const CardUserSignOut = ({ onSuccess, component: Component, ...props }) => {
  const { t } = useTranslation('common');

  const isXs = useXsMediaQuery();

  const { userManager } = useContext(UserManagerContext);
  const onSignOut = useSignOut(userManager, onSuccess);

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
