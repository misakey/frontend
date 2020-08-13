import React, { useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

import { UserManagerContext } from '@misakey/auth/components/OidcProvider';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import isNil from '@misakey/helpers/isNil';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import { useSelector } from 'react-redux';

import { Route } from 'react-router-dom';

// CONSTANTS
const {
  acr: ACR_SELECTOR,
  isAuthenticated: IS_AUTHENTICATED_SELECTOR,
  identifierValue: IDENTIFIER_VALUE_SELECTOR,
} = authSelectors;

// COMPONENTS
const RouteAcr = ({ route: RouteComponent, acr, options, ...rest }) => {
  const { userManager } = useContext(UserManagerContext);

  const currentAcr = useSelector(ACR_SELECTOR);
  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);
  const identifierValue = useSelector(IDENTIFIER_VALUE_SELECTOR);

  const loginHint = useMemo(
    () => (isNil(identifierValue)
      ? ''
      : JSON.stringify({ identifier: identifierValue })),
    [identifierValue],
  );

  if (isNil(currentAcr) && isAuthenticated) {
    throw new Error('authenticated with no acr');
  }

  if (currentAcr >= acr) {
    // ok
    return <RouteComponent {...rest} />;
  }

  // redirect to sign in
  userManager.signinRedirect(objectToSnakeCase({ acrValues: acr, prompt: 'login', loginHint, ...options }));
  return null;
};

RouteAcr.propTypes = {
  route: PropTypes.elementType,
  acr: PropTypes.number.isRequired,
  options: PropTypes.object,
};

RouteAcr.defaultProps = {
  route: Route,
  options: {},
};

export default RouteAcr;
