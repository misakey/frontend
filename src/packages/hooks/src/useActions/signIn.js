import React, { useMemo, useCallback } from 'react';

import { screenAuthSetIdentifier, screenAuthSetPublics } from 'store/actions/screens/auth';

import routes from 'routes';

import { useDispatch } from 'react-redux';

import { Link, useHistory } from 'react-router-dom';
import { SECLEVEL_CONFIG, DEFAULT_SECLEVEL, STEP } from 'constants/auth';
import { BUTTON_STANDINGS } from 'components/dumb/Button';

import AddIcon from '@material-ui/icons/Add';

// CONSTANTS
const IDENTIFIER_CONTENT_ACTIONS = {
  email: {
    buttonProps: {
      startIcon: <AddIcon />,
      standing: BUTTON_STANDINGS.TEXT,
      to: routes.auth.signUp.preamble,
      component: Link,
    },
    textKey: 'auth:signIn.form.action.signUp',
  },
};

const IDENTIFIER_SECONDARY_ACTIONS = {
  email: null,
};

// HOOKS
export const useIdentifierContentAction = (acr, t) => useMemo(
  () => {
    const stepType = SECLEVEL_CONFIG[acr || DEFAULT_SECLEVEL].fieldTypes[STEP.identifier];
    const { buttonProps, textKey } = IDENTIFIER_CONTENT_ACTIONS[stepType];
    return {
      ...buttonProps,
      text: t(textKey),
    };
  },
  [acr, t],
);

export const useSecretContentAction = (acr, t, renewConfirmationCode) => useMemo(
  () => {
    const stepType = SECLEVEL_CONFIG[acr || DEFAULT_SECLEVEL].fieldTypes[STEP.secret];
    const contentActions = {
      password: {
        buttonProps: {
          standing: BUTTON_STANDINGS.TEXT,
          to: routes.auth.forgotPassword,
          component: Link,
        },
        textKey: 'auth:signIn.form.action.forgotPassword',
      },
      confirmationCode: {
        buttonProps: {
          onClick: renewConfirmationCode,
        },
        textKey: 'auth:signIn.form.action.getANewCode.button',
      },
    };
    const { buttonProps, textKey } = contentActions[stepType];
    return {
      ...buttonProps,
      text: t(textKey),
    };
  },
  [acr, renewConfirmationCode, t],
);

export const useIdentifierSecondaryAction = (acr) => {
  const stepType = useMemo(
    () => SECLEVEL_CONFIG[acr || DEFAULT_SECLEVEL].fieldTypes[STEP.identifier],
    [acr],
  );
  return useMemo(() => IDENTIFIER_SECONDARY_ACTIONS[stepType], [stepType]);
};

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

export const useSecretSecondaryAction = (acr, t) => {
  const stepType = useMemo(
    () => SECLEVEL_CONFIG[acr || DEFAULT_SECLEVEL].fieldTypes[STEP.secret],
    [acr],
  );

  const onClick = useClearUser();

  const secondaryActions = useMemo(
    () => ({
      password: { onClick, text: t('common:navigation.history.goBack') },
      confirmationCode: null,
    }),
    [onClick, t],
  );

  return useMemo(() => secondaryActions[stepType], [secondaryActions, stepType]);
};
