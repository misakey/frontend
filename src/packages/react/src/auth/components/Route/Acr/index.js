import React, { useMemo, useEffect } from 'react';

import PropTypes from 'prop-types';

import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import isNil from '@misakey/core/helpers/isNil';

import { useSelector } from 'react-redux';

import { Route } from 'react-router-dom';

import useAskSigninWithHints from '@misakey/react/auth/hooks/useAskSigninWithHints';

// CONSTANTS
const {
  acr: ACR_SELECTOR,
  isAuthenticated: IS_AUTHENTICATED_SELECTOR,
} = authSelectors;

// COMPONENTS
const RouteAcr = ({ route: RouteComponent, acr, options, ...rest }) => {
  const currentAcr = useSelector(ACR_SELECTOR);
  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);
  const askSigninWithHints = useAskSigninWithHints(false);

  const shouldAskRedirect = useMemo(
    () => isNil(currentAcr) || currentAcr < acr,
    [currentAcr, acr],
  );

  useEffect(
    () => {
      if (shouldAskRedirect) {
        askSigninWithHints({
          acrValues: acr,
          ...options,
        });
      }
    },
    [askSigninWithHints, acr, options, shouldAskRedirect],
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
