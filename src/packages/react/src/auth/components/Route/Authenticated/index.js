import React, { useMemo, useEffect } from 'react';

import PropTypes from 'prop-types';

import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import { useSelector } from 'react-redux';

import { Route } from 'react-router-dom';

import useAskSigninWithHints from '@misakey/react/auth/hooks/useAskSigninWithHints';

// CONSTANTS
const {
  isAuthenticated: IS_AUTHENTICATED_SELECTOR,
} = authSelectors;

// COMPONENTS
const RouteAuthenticated = ({ route: RouteComponent, options, ...rest }) => {
  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);

  const askSigninWithHints = useAskSigninWithHints(false);

  const shouldAskRedirect = useMemo(
    () => !isAuthenticated,
    [isAuthenticated],
  );

  useEffect(
    () => {
      if (shouldAskRedirect) {
        askSigninWithHints(options);
      }
    },
    [shouldAskRedirect, options, askSigninWithHints],
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
