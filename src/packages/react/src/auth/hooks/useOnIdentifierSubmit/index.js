
import React, { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

import authRoutes from '@misakey/react/auth/routes';
import { getCode } from '@misakey/core/helpers/apiError';
import isNil from '@misakey/core/helpers/isNil';

import useSafeDestr from '@misakey/hooks/useSafeDestr';

import { ssoUpdate, onSetIdentifier } from '@misakey/react/auth/store/actions/sso';

import SnackbarActionAuthRestart from '@misakey/ui/Snackbar/Action/AuthRestart';
import updateAuthIdentities from '@misakey/core/auth/builder/updateAuthIdentities';
import computeNextAuthMethod from '@misakey/core/auth/helpers/computeNextAuthMethod';
import { useAuthCallbackHintsContext } from '@misakey/react/auth/components/Context/AuthCallbackHints';

export default (loginChallenge) => {
  const dispatch = useDispatch();
  const { push } = useHistory();
  const { search } = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('auth');

  const { getCallbackHints } = useAuthCallbackHintsContext();
  const authCallbackHints = useMemo(() => getCallbackHints(), [getCallbackHints]);

  const { shouldCreateAccount, resetPassword } = useSafeDestr(authCallbackHints);

  const onError = useCallback(
    (e) => {
      const code = getCode(e);
      enqueueSnackbar(t(`auth:error.flow.${code}`), {
        variant: 'warning',
        action: (key) => <SnackbarActionAuthRestart id={key} />,
      });
    },
    [enqueueSnackbar, t],
  );

  return useCallback(
    (nextIdentifier) => updateAuthIdentities({ loginChallenge, identifierValue: nextIdentifier })
      .then((response) => {
        const { identity, authnState } = response;
        const { hasCrypto } = identity;
        return Promise.all([
          dispatch(ssoUpdate({
            ...response,
            methodName: computeNextAuthMethod(authnState, resetPassword),
          })),
          dispatch(onSetIdentifier(nextIdentifier)),
        ]).then(() => {
          if (hasCrypto || !isNil(shouldCreateAccount)) {
            push({ pathname: authRoutes.signIn.secret, search });
          }
        });
      })
      .catch(onError),
    [loginChallenge, onError, dispatch, resetPassword, shouldCreateAccount, push, search],
  );
};
