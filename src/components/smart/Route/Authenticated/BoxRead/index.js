import React, { useState, useMemo, useCallback, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useLocation, useRouteMatch, Route } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

import PropTypes from 'prop-types';

import { notFound } from '@misakey/core/api/constants/errorTypes';
import { UserManagerContext } from '@misakey/react/auth/components/OidcProvider/Context';

import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';
import { getCode } from '@misakey/core/helpers/apiError';
import { getBoxPublicBuilder } from '@misakey/core/api/helpers/builder/boxes';
import { computeInvitationHash, parseInvitationShare } from '@misakey/core/crypto/box/keySplitting';
import { BadKeyShareFormat } from '@misakey/core/crypto/Errors/classes';

import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';
import { makeDenormalizeBoxSelector, receivePublicInfo } from 'store/reducers/box';

import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';

import SplashScreenWithTranslation from '@misakey/ui/Screen/Splash/WithTranslation';

// CONSTANTS
const { isAuthenticated: IS_AUTHENTICATED_SELECTOR } = authSelectors;

// COMPONENTS
const RouteAuthenticatedBoxRead = ({ route: RouteComponent, options, path, ...rest }) => {
  const [displayHints, setDisplayHints] = useState(undefined);
  const [error, setError] = useState(false);
  const { askSigninRedirect } = useContext(UserManagerContext);

  const handleHttpErrors = useHandleHttpErrors();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('boxes');
  const dispatch = useDispatch();

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

  const askSigninProps = useMemo(
    () => ({ ...options, displayHints, creator }),
    [creator, displayHints, options],
  );

  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);

  const invitationShareHash = useMemo(
    () => {
      if (isEmpty(locationHash)) {
        return null;
      }
      try {
        const { value: invitationShare } = parseInvitationShare(locationHash.slice(1));
        computeInvitationHash(invitationShare);
        return false;
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
      && !isNil(invitationShareHash)
      && isNil(displayHints)
      && !error,
    [isAuthenticated, id, title, invitationShareHash, displayHints, error],
  );

  const getBoxPublic = useCallback(
    () => getBoxPublicBuilder({ id, invitationShareHash }),
    [id, invitationShareHash],
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
    ({ title: resourceName, ...boxRest }) => {
      setDisplayHints({ resourceName });
      dispatch(receivePublicInfo(id, { title: resourceName, ...boxRest }));
    },
    [dispatch, id],
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
        askSigninRedirect(askSigninProps, false);
      }
    },
    [askSigninRedirect, askSigninProps, shouldAskRedirect],
  );

  useEffect(
    () => {
      if (!isNil(title)) {
        setDisplayHints({ resourceName: title });
      }
    },
    [title, creatorName, creatorIdentityId],
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
