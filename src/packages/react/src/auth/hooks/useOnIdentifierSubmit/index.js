
import React, { useCallback, useMemo } from 'react';

import authRoutes from '@misakey/react/auth/routes';
import { selectors as ssoSelectors } from '@misakey/react/auth/store/reducers/sso';
import { ssoUpdate, onSetIdentifier } from '@misakey/react/auth/store/actions/sso';

import { getCode } from '@misakey/core/helpers/apiError';
import isNil from '@misakey/core/helpers/isNil';
import updateAuthIdentities from '@misakey/core/auth/builder/updateAuthIdentities';
import computeNextAuthMethod from '@misakey/core/auth/helpers/computeNextAuthMethod';
import { hasConsentDataScope } from '@misakey/core/helpers/scope';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useAuthCallbackHintsContext } from '@misakey/react/auth/components/Context/AuthCallbackHints';

import SnackbarActionAuthRestart from '@misakey/ui/Snackbar/Action/AuthRestart';

// CONSTANTS
const { scope: SCOPE_SELECTOR } = ssoSelectors;

// HOOKS
export default (loginChallenge) => {
  const dispatch = useDispatch();
  const { push } = useHistory();
  const { search } = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('auth');

  const scope = useSelector(SCOPE_SELECTOR);

  const hasDataConsentScope = useMemo(
    () => hasConsentDataScope(scope),
    [scope],
  );

  const { getCallbackHints } = useAuthCallbackHintsContext();
  const authCallbackHints = useMemo(() => getCallbackHints(), [getCallbackHints]);

  const { shouldCreateAccount, resetPassword } = useSafeDestr(authCallbackHints);

  // we require account creation before data sharing consent
  const mustAskAccountCreation = useMemo(
    () => hasDataConsentScope === true && shouldCreateAccount === false,
    [hasDataConsentScope, shouldCreateAccount],
  );

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
          if (hasCrypto || (!isNil(shouldCreateAccount) && !mustAskAccountCreation)) {
            push({ pathname: authRoutes.signIn.secret, search });
          }
        });
      })
      .catch(onError),
    [
      loginChallenge, onError, dispatch, resetPassword,
      shouldCreateAccount, mustAskAccountCreation,
      push, search,
    ],
  );
};
