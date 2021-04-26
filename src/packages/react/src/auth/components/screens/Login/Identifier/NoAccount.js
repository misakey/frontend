import React, { useMemo, useContext, useCallback } from 'react';

import PropTypes from 'prop-types';

import authRoutes from '@misakey/react/auth/routes';
import { BUTTON_STANDINGS } from '@misakey/ui/Button';

import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useClearUser } from '@misakey/hooks/useActions/loginSecret';

import CardUser from '@misakey/ui/Card/User';
import IconButton from '@material-ui/core/IconButton';
import BoxControlsCard from '@misakey/ui/Box/Controls/Card';
import { UserManagerContext } from '@misakey/react/auth/components/OidcProvider/Context';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Box from '@material-ui/core/Box';
import isNil from '@misakey/core/helpers/isNil';

import { ssoSetMethodName } from '@misakey/react/auth/store/actions/sso';
import CloseIcon from '@material-ui/icons/Close';
import { IDENTITY_EMAILED_CODE } from '@misakey/core/auth/constants/amr';
import { useAuthCallbackHintsContext } from '@misakey/react/auth/components/Context/AuthCallbackHints';
import useResetAuthHref from '@misakey/react/auth/hooks/useResetAuthHref';

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: theme.spacing(1),
  },
}));

// COMPONENTS
const AuthLoginIdentifierNoAccount = ({ identifier, loginChallenge, userPublicData }) => {
  const { t } = useTranslation(['auth', 'common']);
  const classes = useStyles();

  const { userManager } = useContext(UserManagerContext);
  const { push } = useHistory();
  const dispatch = useDispatch();

  const { getCallbackHints, updateCallbackHints } = useAuthCallbackHintsContext();
  const authCallbackHints = useMemo(() => getCallbackHints(), [getCallbackHints]);

  const resetAuthHref = useResetAuthHref(loginChallenge);

  const onNext = useCallback(
    () => {
      dispatch(ssoSetMethodName(IDENTITY_EMAILED_CODE));
      push(authRoutes.signIn.secret);
    },
    [dispatch, push],
  );

  const onSignup = useCallback(
    async () => {
      if (isNil(authCallbackHints)) {
        // if hints are not found, app will not be able to read it at
        // the end of the flow so it's pointless to add instructions in it.
        // Fallback is to launch a new auth flow for user to perform
        // the account creation on Misakey with a referrer that allow them to come back and
        // finish their current flow.
        // It can happen for example if current flow is a consent flow launched from an integrator.
        return userManager.signinRedirect({
          loginHint: identifier,
          misakeyCallbackHints: { shouldCreateAccount: true },
          referrer: resetAuthHref,
        });
      }
      await updateCallbackHints({ shouldCreateAccount: true });
      return onNext();
    },
    [authCallbackHints, identifier, onNext, resetAuthHref, updateCallbackHints, userManager],
  );

  const onClearUser = useClearUser();

  const primary = useMemo(
    () => ({
      text: t('common:createAccount'),
      onClick: onSignup,
      classes: { wrapper: classes.button },
    }),
    [classes.button, onSignup, t],
  );

  const secondary = useMemo(
    () => ({
      text: t('auth:login.identifier.oneTimeCode'),
      onClick: onNext,
      standing: BUTTON_STANDINGS.TEXT,
      classes: { wrapper: classes.button },
    }),
    [classes.button, onNext, t],
  );

  return (
    <Box display="flex" flexDirection="column" width="100%">
      <CardUser
        hideSkeleton
        mt={3}
        action={(
          <IconButton aria-label={t('common:signOut')} onClick={onClearUser}>
            <CloseIcon />
          </IconButton>
        )}
        {...userPublicData}
      />
      <BoxControlsCard primary={primary} secondary={secondary} />
    </Box>
  );
};


AuthLoginIdentifierNoAccount.propTypes = {
  userPublicData: PropTypes.shape({
    avatarUrl: PropTypes.string,
    displayName: PropTypes.string,
    identifier: PropTypes.string,
  }).isRequired,
  loginChallenge: PropTypes.string.isRequired,
  identifier: PropTypes.string.isRequired,
};


export default AuthLoginIdentifierNoAccount;
