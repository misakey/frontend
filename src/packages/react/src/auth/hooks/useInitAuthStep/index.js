import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';

import { isAuthStepAlreadyExistsConflict } from '@misakey/core/auth/helpers/errors';
import initAuthStepBuilder from '@misakey/core/auth/builder/initAuthStep';
import { IDENTITY_EMAILED_CODE } from '@misakey/core/auth/constants/amr';

import isString from '@misakey/core/helpers/isString';

import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { ssoSetMethodMetadata } from '../../store/actions/sso';

// CONSTANTS
const IDENTITY_EMAILED_CODE_METADATA = 'codeSent';

// HOOKS
/**
 * @param {Object} params
 * @param {string} params.loginChallenge login challenge
 * @param {string} params.identityId identity ID for which authentication step will be initialized
 * @param {string} params.methodName method used by authentication step
 */
export default ({ methodName, ...params }, { successText, disableSnackbar }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation('auth');
  const handleHttpErrors = useHandleHttpErrors();
  const dispatch = useDispatch();

  return useCallback(
    (cbArgs) => initAuthStepBuilder({ methodName, ...params, ...cbArgs })
      .then(({ metadata }) => {
        dispatch(ssoSetMethodMetadata(
          methodName,
          methodName === IDENTITY_EMAILED_CODE ? IDENTITY_EMAILED_CODE_METADATA : metadata,
        ));
        if (isString(successText)) {
          enqueueSnackbar(successText, { variant: 'success' });
        }
      })
      .catch((error) => {
        if (isAuthStepAlreadyExistsConflict(error)) {
          // no need to show the error to user in some case (when they didn't cause the action)
          if (!disableSnackbar) {
            enqueueSnackbar(t('auth:login.form.error.conflict'), { variant: 'warning' });
          }
          // error is handled
          return;
        }
        handleHttpErrors(error);
      }),
    [methodName, params, dispatch, successText, enqueueSnackbar,
      disableSnackbar, handleHttpErrors, t],
  );
};
