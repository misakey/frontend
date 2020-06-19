import { useMemo, useCallback } from 'react';

import { EMAILED_CODE, PREHASHED_PASSWORD } from '@misakey/auth/constants/method';

import { screenAuthSetIdentifier, screenAuthSetPublics } from 'store/actions/screens/auth';
import routes from 'routes';

import propOr from '@misakey/helpers/propOr';

import { useDispatch } from 'react-redux';

import { Link, useHistory } from 'react-router-dom';
import { BUTTON_STANDINGS } from '@misakey/ui/Button';


// HELPERS
const propOrEmptyObj = propOr({});

// HOOKS
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
          to: routes.auth.forgotPassword,
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
      dispatch(screenAuthSetIdentifier('')),
      dispatch(screenAuthSetPublics(null)),
    ]).then(() => {
      push(routes.auth.signIn._);
    }),
    [dispatch, push],
  );
};
