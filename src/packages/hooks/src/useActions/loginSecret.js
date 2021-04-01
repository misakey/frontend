import { useMemo, useCallback } from 'react';

import { EMAILED_CODE, PREHASHED_PASSWORD } from '@misakey/core/auth/constants/method';

import { onResetSsoIdentity, onSetIdentifier } from '@misakey/react-auth/store/actions/sso';

import authRoutes from '@misakey/react-auth/routes';

import propOr from '@misakey/core/helpers/propOr';

import { useDispatch } from 'react-redux';

import { Link, useHistory } from 'react-router-dom';
import { BUTTON_STANDINGS } from '@misakey/ui/Button';


// HELPERS
const propOrEmptyObj = propOr({});

// HOOKS
// @DEPRECATED
export const useSecretContentAction = (methodName, t, renewConfirmationCode) => useMemo(
  () => {
    const contentActions = {
      [EMAILED_CODE]: {
        buttonProps: {
          standing: BUTTON_STANDINGS.TEXT,
          onClick: renewConfirmationCode,
        },
        textKey: 'auth:login.form.action.getANewCode.button',
      },
      [PREHASHED_PASSWORD]: {
        buttonProps: {
          standing: BUTTON_STANDINGS.TEXT,
          to: authRoutes.forgotPassword,
          component: Link,
        },
        textKey: 'auth:login.form.action.forgotPassword',
      },
    };
    const { buttonProps, textKey } = propOrEmptyObj(methodName, contentActions);
    return {
      ...buttonProps,
      text: t(textKey),
    };
  },
  [methodName, renewConfirmationCode, t],
);

export const useClearUser = () => {
  const dispatch = useDispatch();
  const { push } = useHistory();

  return useCallback(
    () => Promise.all([
      dispatch(onSetIdentifier('')),
      dispatch(onResetSsoIdentity()),
    ]).then(() => {
      push(authRoutes.signIn._);
    }),
    [dispatch, push],
  );
};
