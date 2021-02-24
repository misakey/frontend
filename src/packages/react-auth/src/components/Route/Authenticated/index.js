import React, { useMemo, useEffect } from 'react';

import PropTypes from 'prop-types';

import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';

import { useSelector } from 'react-redux';

import { Route } from 'react-router-dom';

import useAskSigninWithLoginHint from '@misakey/react-auth/hooks/useAskSigninWithLoginHint';

// CONSTANTS
const {
  isAuthenticated: IS_AUTHENTICATED_SELECTOR,
} = authSelectors;

// COMPONENTS
const RouteAuthenticated = ({ route: RouteComponent, options, ...rest }) => {
  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);

  const askSigninWithLoginHint = useAskSigninWithLoginHint(false);

  const shouldAskRedirect = useMemo(
    () => !isAuthenticated,
    [isAuthenticated],
  );

  useEffect(
    () => {
      if (shouldAskRedirect) {
        askSigninWithLoginHint(options);
      }
    },
    [shouldAskRedirect, options, askSigninWithLoginHint],
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
