import React, { useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import routes from 'routes';

import { redirectToApp } from '@misakey/helpers/plugin';
import { IS_PLUGIN } from 'constants/plugin';

import { withUserManager } from '@misakey/auth/components/OidcProvider';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import isFunction from '@misakey/helpers/isFunction';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

// COMPONENTS
// @FIXME create a wrapper in auth package for this logic
const ButtonConnectSimple = forwardRef(
  ({ userManager, authProps, children, onClick, t, ...props }, ref) => {
    const onButtonClick = useCallback(
      (...args) => {
        if (isFunction(onClick)) {
          onClick(...args);
        }
        if (IS_PLUGIN) {
          redirectToApp(routes.auth.redirectToSignIn);
          return;
        }
        userManager.signinRedirect(objectToSnakeCase(authProps));
      },
      [authProps, onClick, userManager],
    );

    return (
      <Button
        ref={ref}
        onClick={onButtonClick}
        text={t('components:buttonConnect.signIn')}
        standing={BUTTON_STANDINGS.MAIN}
        {...omitTranslationProps(props)}
      />
    );
  },
);

ButtonConnectSimple.propTypes = {
  t: PropTypes.func.isRequired,
  onClick: PropTypes.func,
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
  onClick: null,
  authProps: {},
};

export default withUserManager(withTranslation('components')(ButtonConnectSimple));
