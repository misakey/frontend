import React, { useState, useMemo, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';

import { UserManagerContext } from '@misakey/auth/components/OidcProvider';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import { getBoxPublicBuilder } from '@misakey/helpers/builder/boxes';
import { computeInvitationHash } from '@misakey/crypto/box/keySplitting';

import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import { useSelector } from 'react-redux';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { useLocation, useRouteMatch, Route } from 'react-router-dom';

import SplashScreenWithTranslation from '@misakey/ui/Screen/Splash/WithTranslation';

// CONSTANTS
const { isAuthenticated: IS_AUTHENTICATED_SELECTOR } = authSelectors;

// COMPONENTS
const RouteAuthenticatedBoxRead = ({ route: RouteComponent, options, path, ...rest }) => {
  const [resourceName, setResourceName] = useState();
  const { userManager } = useContext(UserManagerContext);

  const redirectOptions = useMemo(
    () => objectToSnakeCase({
      ...options,
      loginHint: JSON.stringify(objectToSnakeCase({ resourceName })),
    }),
    [options, resourceName],
  );

  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);
  const { hash } = useLocation();
  const { params } = useRouteMatch(path);

  const { id } = useSafeDestr(params);

  const keyShare = useMemo(
    () => (isEmpty(hash)
      ? null
      : computeInvitationHash(hash.substr(1))),
    [hash],
  );

  const shouldFetch = useMemo(
    () => !isAuthenticated && !isNil(id) && !isNil(keyShare) && isNil(resourceName),
    [isAuthenticated, id, keyShare, resourceName],
  );

  const getBoxPublic = useCallback(
    () => getBoxPublicBuilder({ id, otherShareHash: keyShare }),
    [id, keyShare],
  );

  const onSuccess = useCallback(
    ({ title }) => setResourceName(title),
    [setResourceName],
  );

  const { isFetching } = useFetchEffect(
    getBoxPublic,
    { shouldFetch },
    { onSuccess },
  );

  if (isAuthenticated) {
    return <RouteComponent path={path} {...rest} />;
  }

  if (isFetching || shouldFetch || isNil(keyShare)) {
    return <SplashScreenWithTranslation />;
  }

  // redirect to sign in
  userManager.signinRedirect(redirectOptions);
  return null;
};

RouteAuthenticatedBoxRead.propTypes = {
  route: PropTypes.elementType,
  options: PropTypes.object,
  path: PropTypes.string.isRequired,
};

RouteAuthenticatedBoxRead.defaultProps = {
  route: Route,
  options: {},
};

export default RouteAuthenticatedBoxRead;
