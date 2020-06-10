import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import isFunction from '@misakey/helpers/isFunction';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import ButtonConnect from '@misakey/ui/Button/Connect';
import { signIn, signOut } from '../../../../store/actions/auth';
import { withUserManager } from '../../../OidcProvider';

// COMPONENTS
const Wrapper = ({ AccountLink, userManager, onSignOut, signInAction, authProps, ...props }) => {
  const handleSignOut = useCallback(
    () => {
      userManager.removeUser().then(() => {
        if (isFunction(onSignOut)) { onSignOut(); }
      });
    },
    [onSignOut, userManager],
  );

  const handleSignIn = useCallback(
    () => {
      if (isFunction(signInAction)) { signInAction(); return; }
      userManager.signinRedirect(objectToSnakeCase(authProps));
    },
    [authProps, signInAction, userManager],
  );

  return (
    <ButtonConnect
      {...props}
      signInAction={handleSignIn}
      onSignOut={handleSignOut}
      AccountLink={AccountLink}
    />
  );
};

Wrapper.propTypes = {
  AccountLink: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  authProps: PropTypes.shape({
    acrValues: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.number),
    ]),
    scope: PropTypes.string,
  }),
  onSignOut: PropTypes.func,
  signInAction: PropTypes.func,
  userManager: PropTypes.object.isRequired,
};

Wrapper.defaultProps = {
  AccountLink: Link,
  signInAction: null,
  onSignOut: null,
  authProps: {},
};

// CONNECT
const mapStateToProps = (state) => ({
  id: state.auth.id,
  token: state.auth.token,
  identity: state.auth.identity,
});
const mapDispatchToProps = (dispatch) => ({
  onSignOut: () => dispatch(signOut()),
  onSignIn: (identity) => dispatch(signIn({ identity })),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withUserManager(Wrapper));
