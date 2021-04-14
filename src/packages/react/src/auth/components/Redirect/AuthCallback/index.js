import React, { useState, useCallback } from 'react';
import { batch, useDispatch } from 'react-redux';

import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

import PropTypes from 'prop-types';

import useIdentityCallback from '@misakey/react/auth/hooks/useIdentity/callback';
import useMountEffect from '@misakey/hooks/useMountEffect';

import { loadUserThunk, setExpiresAt } from '@misakey/react/auth/store/actions/auth';

import { useUserManagerContext } from '@misakey/react/auth/components/OidcProvider/Context';
import Redirect from '@misakey/ui/Redirect';
import DialogCreatePassword from '../../Dialog/Password/Create';

// COMPONENTS
const RedirectAuthCallback = ({ loadingPlaceholder, fallbackReferrer }) => {
  const [redirect, setRedirect] = useState(false);
  const [referrer, setReferrer] = useState(false);
  const [isDialogOpened, setIsDialogOpened] = useState(false);
  const [isReset, setIsReset] = useState(false);

  const { userManager } = useUserManagerContext();

  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('common');
  const dispatch = useDispatch();

  const fetchIdentity = useIdentityCallback();

  const onClose = useCallback(
    () => {
      setIsDialogOpened(false);
      setRedirect(referrer || fallbackReferrer);
    },
    [fallbackReferrer, referrer],
  );

  const processCallback = useCallback(
    async () => {
      try {
        const {
          state = {},
          user,
          expiresAt,
        } = await userManager.signinCallback(window.location.href);

        batch(() => {
          dispatch(loadUserThunk(user));
          dispatch(setExpiresAt(expiresAt));
        });

        const { identityId } = user;
        const { referrer: nextReferrer, shouldCreateAccount, resetPassword } = state;
        setReferrer(nextReferrer);

        // auth flow is finished, user can be redirected to referrer
        if (!shouldCreateAccount && !resetPassword) {
          return setRedirect(true);
        }

        // user has clicked either on resetPassword or createAccount
        const identity = await fetchIdentity(identityId);
        const { hasCrypto } = identity;

        if (hasCrypto && shouldCreateAccount && !resetPassword) {
          // it can happened if user has clicked on `createAccount` not authenticated
          // and then connect with an existing account
          return setRedirect(true);
        }

        setIsDialogOpened(true);
        return setIsReset(resetPassword);
      } catch (e) {
        // this error has already been logged in Sentry by userManager
        enqueueSnackbar(t('common:anErrorOccurred'), { variant: 'warning' });
        const { referrer: nextReferrer } = e.state || {};
        setReferrer(nextReferrer);
        return setRedirect(true);
      }
    },
    [userManager, fetchIdentity, dispatch, enqueueSnackbar, t],
  );

  useMountEffect(processCallback);

  if (redirect) {
    return (
      <Redirect
        to={referrer || fallbackReferrer}
        manualRedirectPlaceholder={loadingPlaceholder}
      />
    );
  }

  return (
    <>
      <DialogCreatePassword open={isDialogOpened} onClose={onClose} isReset={isReset} />
      {!isDialogOpened && loadingPlaceholder}
    </>
  );
};

RedirectAuthCallback.propTypes = {
  fallbackReferrer: PropTypes.string,
  loadingPlaceholder: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
  location: PropTypes.shape({ hash: PropTypes.string, search: PropTypes.string }).isRequired,
};

RedirectAuthCallback.defaultProps = {
  fallbackReferrer: '/',
  loadingPlaceholder: null,
};

export default RedirectAuthCallback;
