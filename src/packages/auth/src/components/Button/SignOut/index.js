import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { signOut } from '@misakey/auth/store/actions/auth';
import signOutBuilder from '@misakey/auth/builder/signOut';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import { withUserManager } from '@misakey/auth/components/OidcProvider';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

// COMPONENTS
const ButtonSignOut = ({
  userManager, onSignOut,
  t, ...props
}) => {
  const onClick = useCallback(
    (e) => signOutBuilder()
      .then(() => userManager.removeUser())
      .then(() => Promise.resolve(onSignOut(e))),
    [onSignOut, userManager],
  );
  return (
    <Button
      onClick={onClick}
      text={t('auth:signOut.button')}
      {...omitTranslationProps(props)}
    />
  );
};

ButtonSignOut.propTypes = {
  t: PropTypes.func.isRequired,
  standing: PropTypes.oneOf(Object.values(BUTTON_STANDINGS)),
  // withUserManager
  userManager: PropTypes.object.isRequired,
  // CONNECT
  onSignOut: PropTypes.func.isRequired,
};

ButtonSignOut.defaultProps = {
  standing: BUTTON_STANDINGS.CANCEL,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  onSignOut: () => dispatch(signOut()),
});

export default connect(null, mapDispatchToProps)(withTranslation('auth')(withUserManager(ButtonSignOut)));
