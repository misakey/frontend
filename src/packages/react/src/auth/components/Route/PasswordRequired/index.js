import React, { useMemo, useEffect } from 'react';

import PropTypes from 'prop-types';

import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import { useSelector } from 'react-redux';

import { Route } from 'react-router-dom';

import useAskSigninWithLoginHint from '@misakey/react/auth/hooks/useAskSigninWithLoginHint';
import useAskToSetPassword from '@misakey/react/auth/hooks/useAskToSetPassword';
import isNil from '@misakey/core/helpers/isNil';
import isFunction from '@misakey/core/helpers/isFunction';

// CONSTANTS
const {
  isAuthenticated: IS_AUTHENTICATED_SELECTOR,
  hasCrypto: HAS_CRYPTO_SELECTOR,
} = authSelectors;

// COMPONENTS
const RoutePasswordRequired = ({ route: RouteComponent, ...rest }) => {
  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);
  const hasCrypto = useSelector(HAS_CRYPTO_SELECTOR);

  const askSigninWithLoginHint = useAskSigninWithLoginHint(false);
  const onAskToSetPassword = useAskToSetPassword();

  const requiredAction = useMemo(
    () => {
      if (!isAuthenticated) { return askSigninWithLoginHint; }
      if (!hasCrypto) { return onAskToSetPassword; }
      return null;
    },
    [askSigninWithLoginHint, hasCrypto, isAuthenticated, onAskToSetPassword],
  );

  const isAccessToRouteAllowed = useMemo(
    () => isNil(requiredAction),
    [requiredAction],
  );

  useEffect(
    () => {
      if (isFunction(requiredAction)) {
        requiredAction();
      }
    },
    [requiredAction],
  );

  if (isAccessToRouteAllowed) {
    return <RouteComponent {...rest} />;
  }

  return null;
};

RoutePasswordRequired.propTypes = {
  route: PropTypes.elementType,
};

RoutePasswordRequired.defaultProps = {
  route: Route,
};

export default RoutePasswordRequired;
