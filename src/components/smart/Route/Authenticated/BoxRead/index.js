import { useState, useMemo, useCallback, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

import { notFound } from '@misakey/ui/constants/errorTypes';
import { UserManagerContext } from '@misakey/auth/components/OidcProvider/Context';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import { getCode } from '@misakey/helpers/apiError';
import { getBoxPublicBuilder } from '@misakey/helpers/builder/boxes';
import { computeInvitationHash } from '@misakey/crypto/box/keySplitting';
import { BadKeyShareFormat } from '@misakey/crypto/Errors/classes';

import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';
import { makeDenormalizeBoxSelector } from 'store/reducers/box';

import { useSelector } from 'react-redux';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { useLocation, useRouteMatch, Route } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

import SplashScreenWithTranslation from '@misakey/ui/Screen/Splash/WithTranslation';

// CONSTANTS
const { isAuthenticated: IS_AUTHENTICATED_SELECTOR } = authSelectors;

// COMPONENTS
const RouteAuthenticatedBoxRead = ({ route: RouteComponent, options, path, ...rest }) => {
  const [objLoginHint, setObjLoginHint] = useState();
  const [error, setError] = useState(false);
  const { askSigninRedirect } = useContext(UserManagerContext);

  const handleHttpErrors = useHandleHttpErrors();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('boxes');

  const loginHint = useMemo(
    () => (!isEmpty(objLoginHint)
      ? JSON.stringify(objectToSnakeCase(objLoginHint))
      : null),
    [objLoginHint],
  );

  const redirectOptions = useMemo(
    () => (isNil(loginHint) ? options : { ...options, loginHint }),
    [loginHint, options],
  );

  // locationHash is a URL hash
  // (see https://developer.mozilla.org/en-US/docs/Web/API/URL/hash),
  // not be confused with the output of a hash function
  const { hash: locationHash } = useLocation();
  const { params } = useRouteMatch(path);

  const { id } = useSafeDestr(params);

  const denormalizeBoxSelector = useMemo(
    () => makeDenormalizeBoxSelector(),
    [],
  );

  // if box and box title are already in store, don't refetch
  const box = useSelector((state) => denormalizeBoxSelector(state, id));

  const { title, creator } = useSafeDestr(box);
  const { displayName: creatorName, id: creatorIdentityId } = useSafeDestr(creator);

  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);

  const otherShareHash = useMemo(
    () => {
      if (isEmpty(locationHash)) {
        return null;
      }
      try {
        return computeInvitationHash(locationHash.substr(1));
      } catch (e) {
        if (e instanceof BadKeyShareFormat) {
          enqueueSnackbar(t('boxes:read.errors.malformed'), { variant: 'warning' });
        }
        return null;
      }
    },
    [locationHash, enqueueSnackbar, t],
  );

  const shouldFetch = useMemo(
    () => !isAuthenticated
    && !isNil(id) && isNil(title)
    && !isNil(otherShareHash) && isEmpty(objLoginHint)
    && !error,
    [isAuthenticated, id, otherShareHash, objLoginHint, error, title],
  );

  const getBoxPublic = useCallback(
    () => getBoxPublicBuilder({ id, otherShareHash }),
    [id, otherShareHash],
  );

  const onIgnoreNotFoundError = useCallback(
    (e) => {
      const errorCode = getCode(e);
      // in case of not found error, it is already handled by useHandleBoxKeyShare
      if (errorCode !== notFound) {
        handleHttpErrors(e);
      }
      setError(true);
    },
    [handleHttpErrors],
  );

  const onSuccess = useCallback(
    ({ title: resourceName, creator: { displayName, id: creatorId } = {} }) => {
      setObjLoginHint({
        resourceName,
        creatorName: displayName,
        creatorIdentityId: creatorId,
      });
    },
    [setObjLoginHint],
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

  useEffect(
    () => {
      if (!isNil(title) || !isNil(creatorName) || !isNil(creatorIdentityId)) {
        setObjLoginHint({ resourceName: title, creatorName, creatorIdentityId });
      }
    },
    [title, creatorName, creatorIdentityId, setObjLoginHint],
  );

  if (isAuthenticated) {
    return <RouteComponent path={path} {...rest} />;
  }

  if (isFetching) {
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
