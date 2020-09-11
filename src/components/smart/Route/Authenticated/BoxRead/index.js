import React, { useState, useMemo, useCallback, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import errorTypes from '@misakey/ui/constants/errorTypes';
import { UserManagerContext } from '@misakey/auth/components/OidcProvider';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import { getCode } from '@misakey/helpers/apiError';
import { getBoxPublicBuilder } from '@misakey/helpers/builder/boxes';
import { computeInvitationHash } from '@misakey/crypto/box/keySplitting';

import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import { useSelector } from 'react-redux';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { useLocation, useRouteMatch, Route } from 'react-router-dom';

import SplashScreenWithTranslation from '@misakey/ui/Screen/Splash/WithTranslation';

// CONSTANTS
const { isAuthenticated: IS_AUTHENTICATED_SELECTOR } = authSelectors;
const { notFound } = errorTypes;

// COMPONENTS
const RouteAuthenticatedBoxRead = ({ route: RouteComponent, options, path, ...rest }) => {
  const [resourceName, setResourceName] = useState();
  const { askSigninRedirect } = useContext(UserManagerContext);

  const handleHttpErrors = useHandleHttpErrors();

  const loginHint = useMemo(
    () => (!isNil(resourceName)
      ? JSON.stringify(objectToSnakeCase({ resourceName }))
      : null),
    [resourceName],
  );

  const redirectOptions = useMemo(
    () => {
      const args = isNil(loginHint) ? options : { ...options, loginHint };
      return objectToSnakeCase(args);
    },
    [loginHint, options],
  );

  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);
  const { hash } = useLocation();
  const { params } = useRouteMatch(path);

  const { id } = useSafeDestr(params);

  const keyShare = useMemo(
    () => {
      if (isEmpty(hash)) {
        return null;
      }
      try {
        return computeInvitationHash(hash.substr(1));
      } catch (e) {
        return null;
      }
    },
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

  const onIgnoreNotFoundError = useCallback(
    (e) => {
      const errorCode = getCode(e);
      // in case of not found error, it is already handled by useHandleBoxKeyShare
      if (errorCode !== notFound) {
        handleHttpErrors(e);
      }
    },
    [handleHttpErrors],
  );

  const { isFetching } = useFetchEffect(
    getBoxPublic,
    { shouldFetch },
    { onSuccess, onError: onIgnoreNotFoundError },
  );

  const shouldAskRedirect = useMemo(
    () => !isAuthenticated && !isFetching && !shouldFetch,
    [isAuthenticated, isFetching, shouldFetch],
  );

  useEffect(
    () => {
      if (shouldAskRedirect) {
        askSigninRedirect(redirectOptions, false);
      }
    },
    [askSigninRedirect, redirectOptions, shouldAskRedirect],
  );



  if (isAuthenticated) {
    return <RouteComponent path={path} {...rest} />;
  }

  if (isFetching || shouldFetch) {
    return <SplashScreenWithTranslation />;
  }

  // redirect to sign in
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
