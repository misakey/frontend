import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { signOut } from '@misakey/auth/store/actions/auth';
import signOutBuilder from '@misakey/auth/builder/signOut';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import isFunction from '@misakey/helpers/isFunction';

import { withUserManager } from '@misakey/auth/components/OidcProvider';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

// COMPONENTS
const ButtonSignOut = ({
  userManager, onSignOut, onSuccess,
  t, ...props
}) => {
  const onClick = useCallback(
    (e) => signOutBuilder()
      .then(() => userManager.removeUser())
      .then(() => Promise.resolve(onSignOut(e)))
      .then(() => { if (isFunction(onSuccess)) { onSuccess(e); } }),
    [onSignOut, onSuccess, userManager],
  );
  return (
    <Button
      onClick={onClick}
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
  // CONNECT
  onSignOut: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

ButtonSignOut.defaultProps = {
  standing: BUTTON_STANDINGS.CANCEL,
  onSuccess: null,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  onSignOut: () => dispatch(signOut()),
});

export default connect(null, mapDispatchToProps)(withTranslation('common')(withUserManager(ButtonSignOut)));
