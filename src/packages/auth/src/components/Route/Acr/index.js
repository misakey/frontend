import React, { useContext, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';

import { UserManagerContext } from '@misakey/auth/components/OidcProvider/Context';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import isNil from '@misakey/helpers/isNil';

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
  const { askSigninRedirect } = useContext(UserManagerContext);

  const currentAcr = useSelector(ACR_SELECTOR);
  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);
  const identifierValue = useSelector(IDENTIFIER_VALUE_SELECTOR);

  const shouldAskRedirect = useMemo(
    () => isNil(currentAcr) || currentAcr < acr,
    [currentAcr, acr],
  );

  const loginHint = useMemo(
    () => (isNil(identifierValue)
      ? ''
      : JSON.stringify({ identifier: identifierValue })),
    [identifierValue],
  );

  useEffect(
    () => {
      if (shouldAskRedirect) {
        askSigninRedirect({ acrValues: acr, loginHint, ...options }, false);
      }
    },
    [askSigninRedirect, acr, loginHint, options, shouldAskRedirect],
  );

  if (isNil(currentAcr) && isAuthenticated) {
    throw new Error('authenticated with no acr');
  }

  if (!shouldAskRedirect) {
    // ok
    return <RouteComponent {...rest} />;
  }

  // redirect to sign in
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
