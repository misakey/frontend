
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

import authRoutes from '@misakey/react/auth/routes';
import { getCode } from '@misakey/core/helpers/apiError';

import useSafeDestr from '@misakey/hooks/useSafeDestr';

import { ssoUpdate, onSetIdentifier } from '@misakey/react/auth/store/actions/sso';

import SnackbarActionAuthRestart from '@misakey/ui/Snackbar/Action/AuthRestart';
import useGetAskedAuthState from '@misakey/react/auth/hooks/useGetAskedAuthState';
import updateAuthIdentities from '@misakey/core/auth/builder/updateAuthIdentities';
import computeNextAuthMethod from '@misakey/core/auth/helpers/computeNextAuthMethod';

export default (loginChallenge) => {
  const dispatch = useDispatch();
  const { push } = useHistory();
  const { search } = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('auth');

  const { state } = useGetAskedAuthState();

  const { shouldCreateAccount } = useSafeDestr(state);

  return useCallback(
    (nextIdentifier) => updateAuthIdentities({ loginChallenge, identifierValue: nextIdentifier })
      .then((response) => {
        const { identity, authnState } = response;
        const { hasCrypto } = identity;
        return Promise.all([
          dispatch(ssoUpdate({ ...response, methodName: computeNextAuthMethod(authnState) })),
          dispatch(onSetIdentifier(nextIdentifier)),
        ]).then(() => {
          if (hasCrypto || shouldCreateAccount === true) {
            push({ pathname: authRoutes.signIn.secret, search });
          }
        });
      })
      .catch((e) => {
        const code = getCode(e);
        enqueueSnackbar(t(`auth:error.flow.${code}`), {
          variant: 'warning',
          action: (key) => <SnackbarActionAuthRestart id={key} />,
        });
      }),
    [loginChallenge, dispatch, shouldCreateAccount, push, search, enqueueSnackbar, t],
  );
};
