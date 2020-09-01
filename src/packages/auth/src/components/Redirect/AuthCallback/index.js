import React, { useMemo, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { authReset } from '@misakey/auth/store/actions/auth';

import isFunction from '@misakey/helpers/isFunction';
import isNil from '@misakey/helpers/isNil';

import useAuthFlowParams from '@misakey/auth/hooks/useAuthFlowParams';
import { getUrlForOidcCallback } from '../../../helpers';


import { withUserManager } from '../../OidcProvider';

// COMPONENTS
const RedirectAuthCallback = ({
  handleSuccess,
  handleError,
  location,
  fallbackReferrers,
  userManager,
  askSigninRedirect,
}) => {
  const [redirect, setRedirect] = useState(false);

  const {
    search,
    searchParams,
    storageParams: { referrer, scope, acrValues },
  } = useAuthFlowParams();

  const dispatch = useDispatch();

  const dispatchAuthReset = useCallback(
    () => Promise.resolve(dispatch(authReset())),
    [dispatch],
  );

  const processRedirectCallback = useCallback(
    () => {
      const callbackUrl = getUrlForOidcCallback(search, searchParams);
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
            const { email } = user.profile;
            const loginHint = email ? JSON.stringify({ identifier: email }) : '';
            askSigninRedirect({ scope, referrer, acrValues, prompt: 'login', loginHint }, false);
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
      search, searchParams, acrValues, scope, referrer,
      dispatchAuthReset, userManager, askSigninRedirect,
      handleSuccess, handleError,
    ],
  );

  const fallbackReferrer = useMemo(
    () => (searchParams.accessToken ? fallbackReferrers.success : fallbackReferrers.error),
    [searchParams, fallbackReferrers],
  );

  const processCallback = useCallback(() => {
    if (searchParams.accessToken && searchParams.state) {
      processRedirectCallback()
        .then((shouldRedirect) => {
          setRedirect(shouldRedirect);
        });
    } else if (searchParams.error || searchParams.errorCode) {
      if (isFunction(handleError)) {
        handleError(searchParams);
      }
      setRedirect(true);
    }
  }, [searchParams, handleError, processRedirectCallback]);

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
  // withUserManager
  userManager: PropTypes.object.isRequired,
  askSigninRedirect: PropTypes.func.isRequired,
};

RedirectAuthCallback.defaultProps = {
  fallbackReferrers: {},
  handleSuccess: null,
  handleError: null,
};

export default withUserManager(RedirectAuthCallback);
