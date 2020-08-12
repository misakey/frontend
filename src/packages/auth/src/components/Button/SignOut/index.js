import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import { withUserManager } from '@misakey/auth/components/OidcProvider';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import useSignOut from '@misakey/auth/hooks/useSignOut';

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
      {...omitTranslationProps(props)}
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
