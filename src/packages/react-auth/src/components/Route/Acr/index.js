import React, { useMemo, useEffect } from 'react';

import PropTypes from 'prop-types';

import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';

import isNil from '@misakey/core/helpers/isNil';

import { useSelector } from 'react-redux';

import { Route } from 'react-router-dom';

import useAskSigninWithLoginHint from '@misakey/react-auth/hooks/useAskSigninWithLoginHint';

// CONSTANTS
const {
  acr: ACR_SELECTOR,
  isAuthenticated: IS_AUTHENTICATED_SELECTOR,
} = authSelectors;

// COMPONENTS
const RouteAcr = ({ route: RouteComponent, acr, options, ...rest }) => {
  const currentAcr = useSelector(ACR_SELECTOR);
  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);
  const askSigninWithLoginHint = useAskSigninWithLoginHint(false);

  const shouldAskRedirect = useMemo(
    () => isNil(currentAcr) || currentAcr < acr,
    [currentAcr, acr],
  );

  useEffect(
    () => {
      if (shouldAskRedirect) {
        askSigninWithLoginHint({
          acrValues: acr,
          ...options,
        });
      }
    },
    [askSigninWithLoginHint, acr, options, shouldAskRedirect],
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
