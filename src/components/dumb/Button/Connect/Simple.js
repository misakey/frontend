import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import routes from 'routes';

import { redirectToApp } from 'helpers/plugin';
import { IS_PLUGIN } from 'constants/plugin';

import { withUserManager } from '@misakey/auth/components/OidcProvider';

import ButtonConnectNoToken from '@misakey/ui/Button/Connect/NoToken';


// COMPONENTS
// @FIXME create a wrapper in auth package for this logic
const ButtonConnectSimple = ({ userManager, children, ...props }) => {
  const signInAction = useCallback(
    () => {
      if (IS_PLUGIN) {
        redirectToApp(routes.auth.redirectToSignIn);
      } else {
        userManager.signinRedirect();
      }
    },
    [userManager],
  );

  return (
    <ButtonConnectNoToken
      signInAction={signInAction}
      {...props}
    >
      {children}
    </ButtonConnectNoToken>
  );
};

ButtonConnectSimple.propTypes = {
  userManager: PropTypes.shape({
    signinRedirect: PropTypes.func.isRequired,
  }).isRequired,
  children: PropTypes.node,
};

ButtonConnectSimple.defaultProps = {
  children: null,
};

export default withUserManager(ButtonConnectSimple);
