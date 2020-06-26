import React, { useMemo, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { authReset } from '@misakey/auth/store/actions/auth';

import getSearchParams from '@misakey/helpers/getSearchParams';
import isFunction from '@misakey/helpers/isFunction';
import isNil from '@misakey/helpers/isNil';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import { getUrlForOidcCallback } from '../../../helpers';

import { withUserManager } from '../../OidcProvider';

// HOOKS
const useSearchParams = (hash) => useMemo(() => {
  const search = hash.indexOf('#') === 0 ? hash.replace('#', '?') : hash;
  return { hash: search, callbackParams: objectToCamelCase(getSearchParams(search)) };
}, [hash]);

const useGetAuthRequestDetails = (state) => useMemo(
  () => (isNil(state) ? {} : objectToCamelCase(JSON.parse(localStorage.getItem(`oidc.${state}`) || '{}'))),
  [state],
);

// COMPONENTS
const RedirectAuthCallback = ({
  handleSuccess,
  handleError,
  location,
  fallbackReferrers,
  userManager,
}) => {
  const [redirect, setRedirect] = useState(false);

  const { hash, callbackParams } = useSearchParams(location.hash);

  const { state } = callbackParams;
  const authRequestDetails = useGetAuthRequestDetails(state);
  const { referrer, scope, acrValues } = useMemo(() => authRequestDetails, [authRequestDetails]);

  const dispatch = useDispatch();

  const dispatchAuthReset = useCallback(
    () => Promise.resolve(dispatch(authReset())),
    [dispatch],
  );

  const processRedirectCallback = useCallback(
    () => {
      const callbackUrl = getUrlForOidcCallback(hash, callbackParams);
      return dispatchAuthReset()
        .then(() => userManager.signinRedirectCallback(callbackUrl)
          .then((user) => {
            // No specific acr was specified or if specified acr match received acr
            if (isNil(acrValues) || (user.profile.acr.toString() === acrValues.toString())) {
              if (isFunction(handleSuccess)) {
                handleSuccess(user);
              }
              return true;
            }
            userManager.signinRedirect({ scope, referrer, acrValues, prompt: 'login' });
            return false;
          })
          .catch((e) => {
            if (isFunction(handleError)) {
              handleError(e);
            }
            return true;
          }));
    },
    [
      hash, callbackParams, acrValues, scope, referrer,
      dispatchAuthReset, userManager,
      handleSuccess, handleError,
    ],
  );

  const fallbackReferrer = useMemo(
    () => (callbackParams.accessToken ? fallbackReferrers.success : fallbackReferrers.error),
    [callbackParams, fallbackReferrers],
  );

  const processCallback = useCallback(() => {
    if (callbackParams.accessToken && callbackParams.state) {
      processRedirectCallback()
        .then((shouldRedirect) => {
          setRedirect(shouldRedirect);
        });
    } else if (callbackParams.error || callbackParams.errorCode) {
      if (isFunction(handleError)) {
        handleError(callbackParams);
      }
      setRedirect(true);
    }
  }, [callbackParams, handleError, processRedirectCallback]);

  useEffect(processCallback, []);

  useEffect(() => {
    // Firefox BUGFIX: https://bugzilla.mozilla.org/show_bug.cgi?id=1422334#c15
    // Fixed in firefox 70 accodring to https://hg.mozilla.org/mozilla-central/rev/d14199c9c1cc
    // eslint-disable-next-line no-self-assign,no-param-reassign
    location.hash = location.hash;
    // eslint-disable-next-line no-self-assign
    window.location.hash = window.location.hash;
  }, [location.hash]);

  return redirect ? <Redirect to={referrer || fallbackReferrer} /> : null;
};

RedirectAuthCallback.propTypes = {
  fallbackReferrers: PropTypes.shape({
    error: PropTypes.string,
    success: PropTypes.string,
  }),
  handleError: PropTypes.func,
  handleSuccess: PropTypes.func,
  location: PropTypes.shape({ hash: PropTypes.string, search: PropTypes.string }).isRequired,
  userManager: PropTypes.object.isRequired,
};

RedirectAuthCallback.defaultProps = {
  fallbackReferrers: {},
  handleSuccess: null,
  handleError: null,
};

export default withUserManager(RedirectAuthCallback);
