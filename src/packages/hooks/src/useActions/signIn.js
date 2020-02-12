import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SECLEVEL_CONFIG, DEFAULT_SECLEVEL, STEP } from 'components/smart/Auth/SignIn/Form/constants';
import { BUTTON_STANDINGS } from 'components/dumb/Button';
import routes from 'routes';

import AddIcon from '@material-ui/icons/Add';


export const useSignInFormContentAction = (step, acr, t, renewConfirmationCode) => useMemo(() => {
  const stepType = SECLEVEL_CONFIG[acr || DEFAULT_SECLEVEL].fieldTypes[step];
  const secondaryActions = {
    identifier: {
      email: {
        buttonProps: {
          startIcon: <AddIcon />,
          standing: BUTTON_STANDINGS.TEXT,
          to: routes.auth.signUp.preamble,
          component: Link,
        },
        textKey: 'auth:signIn.form.action.signUp',
      },
    },
    secret: {
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
    },
  };
  const { buttonProps, textKey } = secondaryActions[step][stepType];

  return {
    ...buttonProps,
    text: t(textKey),
  };
}, [acr, renewConfirmationCode, step, t]);

export const useSignInFormSecondaryAction = (step, acr, handlePrevious, t) => useMemo(() => {
  const stepType = SECLEVEL_CONFIG[acr || DEFAULT_SECLEVEL].fieldTypes[step];
  const secondaryActions = {
    identifier: {
      email: null,
    },
    secret: {
      password: { onClick: handlePrevious, text: t('common:navigation.history.goBack') },
      confirmationCode: null,
    },
  };
  return secondaryActions[step][stepType];
}, [acr, handlePrevious, step, t]);

const primaryActionsTextKey = {
  identifier: 'auth:signIn.form.action.next',
  secret: 'auth:signIn.form.action.submit',
};

export const useSignInFormPrimaryAction = (
  disableNext,
  isSubmitting,
  isValid,
  onNext,
  step,
  t,
) => useMemo(() => {
  if (step === STEP.identifier) {
    return {
      onClick: onNext,
      disabled: disableNext,
      text: t(primaryActionsTextKey[step]),
    };
  }
  if (step === STEP.secret) {
    return {
      type: 'submit',
      disabled: isSubmitting || !isValid,
      text: t(primaryActionsTextKey[step]),
    };
  }
  return {};
}, [disableNext, isSubmitting, isValid, onNext, step, t]);
