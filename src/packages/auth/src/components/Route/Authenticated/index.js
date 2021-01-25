import React, { useContext, useMemo, useEffect } from 'react';

import PropTypes from 'prop-types';

import { UserManagerContext } from '@misakey/auth/components/OidcProvider/Context';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import isNil from '@misakey/helpers/isNil';

import { useSelector } from 'react-redux';

import { Route } from 'react-router-dom';

// CONSTANTS
const {
  isAuthenticated: IS_AUTHENTICATED_SELECTOR,
  identifierValue: IDENTIFIER_VALUE_SELECTOR,
} = authSelectors;

// COMPONENTS
const RouteAuthenticated = ({ route: RouteComponent, options, ...rest }) => {
  const { askSigninRedirect } = useContext(UserManagerContext);

  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);
  const identifierValue = useSelector(IDENTIFIER_VALUE_SELECTOR);

  const loginHint = useMemo(
    () => (isNil(identifierValue)
      ? ''
      : JSON.stringify({ identifier: identifierValue })),
    [identifierValue],
  );

  const shouldAskRedirect = useMemo(
    () => !isAuthenticated,
    [isAuthenticated],
  );

  useEffect(
    () => {
      if (shouldAskRedirect) {
        askSigninRedirect({ loginHint, ...options }, false);
      }
    },
    [shouldAskRedirect, askSigninRedirect, loginHint, options],
  );

  if (!shouldAskRedirect) {
    return <RouteComponent {...rest} />;
  }

  // redirect to sign in
  return null;
};

RouteAuthenticated.propTypes = {
  route: PropTypes.elementType,
  options: PropTypes.object,
};

RouteAuthenticated.defaultProps = {
  route: Route,
  options: {},
};

export default RouteAuthenticated;
