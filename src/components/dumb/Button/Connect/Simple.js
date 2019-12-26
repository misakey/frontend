import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import routes from 'routes';

import { redirectToApp } from 'helpers/plugin';
import { IS_PLUGIN } from 'constants/plugin';

import { withUserManager } from '@misakey/auth/components/OidcProvider';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import ButtonConnectNoToken from '@misakey/ui/Button/Connect/NoToken';


// COMPONENTS
// @FIXME create a wrapper in auth package for this logic
const ButtonConnectSimple = ({ userManager, authProps, children, ...props }) => {
  const signInAction = useCallback(
    () => {
      if (IS_PLUGIN) {
        redirectToApp(routes.auth.redirectToSignIn);
      } else {
        userManager.signinRedirect(objectToSnakeCase(authProps));
      }
    },
    [authProps, userManager],
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
  authProps: PropTypes.shape({
    acrValues: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.number),
    ]),
    scope: PropTypes.string,
  }),
  children: PropTypes.node,
};

ButtonConnectSimple.defaultProps = {
  children: null,
  authProps: {},
};

export default withUserManager(ButtonConnectSimple);
