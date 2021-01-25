import React, { useState, useCallback } from 'react';

import PropTypes from 'prop-types';

import isFunction from '@misakey/helpers/isFunction';
import isNil from '@misakey/helpers/isNil';

import useMountEffect from '@misakey/hooks/useMountEffect';

import { withUserManager } from '@misakey/auth/components/OidcProvider/Context';
import Redirect from '@misakey/ui/Redirect';

// COMPONENTS
const RedirectAuthCallback = ({
  handleSuccess,
  handleError,
  loadingPlaceholder,
  fallbackReferrer,
  userManager,
}) => {
  const [redirect, setRedirect] = useState(null);

  const processCallback = useCallback(
    async () => {
      try {
        const {
          user,
          referrer,
          expiresAt,
        } = await userManager.signinCallback(window.location.href);
        if (!isNil(user)) {
          if (isFunction(handleSuccess)) {
            await Promise.resolve(handleSuccess(user, expiresAt));
          }
          return setRedirect(referrer);
        }
        return null;
      } catch (e) {
        if (isFunction(handleError)) { handleError(e); }
        return setRedirect(e.referrer || fallbackReferrer);
      }
    },
    [userManager, handleSuccess, handleError, fallbackReferrer],
  );

  useMountEffect(processCallback);

  if (!isNil(redirect)) {
    return (
      <Redirect
        to={redirect}
        manualRedirectPlaceholder={loadingPlaceholder}
      />
    );
  }

  return loadingPlaceholder;
};

RedirectAuthCallback.propTypes = {
  fallbackReferrer: PropTypes.string,
  handleError: PropTypes.func,
  handleSuccess: PropTypes.func,
  loadingPlaceholder: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
  location: PropTypes.shape({ hash: PropTypes.string, search: PropTypes.string }).isRequired,
  // withUserManager
  userManager: PropTypes.object.isRequired,
};

RedirectAuthCallback.defaultProps = {
  fallbackReferrer: '/',
  handleSuccess: null,
  handleError: null,
  loadingPlaceholder: null,
};

export default withUserManager(RedirectAuthCallback);
