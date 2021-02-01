import React, { useMemo, useCallback } from 'react';

import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { conflict } from '@misakey/ui/constants/errorTypes';
import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';
import routes from 'routes';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import isNil from '@misakey/helpers/isNil';
import { getCode, getDescription, getUrlOrigin, getOrigin, getDetailPairs } from '@misakey/helpers/apiError';
import isAnyNotEmpty from '@misakey/helpers/isAnyNotEmpty';

import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import useResetAuthHref from '@misakey/react-auth/hooks/useResetAuthHref';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import Screen from '@misakey/ui/Screen';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Title from '@misakey/ui/Typography/Title';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import BoxControls from '@misakey/ui/Box/Controls';
import AuthErrorDetails from '@misakey/react-auth/components/screens/Error/Details';
import CardUserSignOut from '@misakey/react-auth/components/Card/User/SignOut';
import ButtonSignOut from '@misakey/react-auth/components/Button/SignOut';
import { BUTTON_STANDINGS } from '@misakey/ui/Button';

// CONSTANTS
const { identity: IDENTITY_SELECTOR, isAuthenticated: IS_AUTHENTICATED_SELECTOR } = authSelectors;

// HOOKS
const useStyles = makeStyles(() => ({
  screenContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    overflow: 'auto',
  },
  listFullWidth: {
    flexGrow: 1,
  },
}));

// COMPONENTS
const AuthError = ({ loginChallenge, error, t }) => {
  const classes = useStyles();

  const { errorCode, errorDescription, errorLocation } = useLocationSearchParams(objectToCamelCase);

  const resetAuthHref = useResetAuthHref(loginChallenge);

  const identity = useSelector(IDENTITY_SELECTOR);
  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);

  const { avatarUrl, displayName, identifierValue } = useSafeDestr(identity);

  const showCard = useMemo(
    () => isAnyNotEmpty([avatarUrl, displayName, identifierValue]),
    [avatarUrl, displayName, identifierValue],
  );

  const code = useMemo(
    () => getCode(error),
    [error],
  );

  const description = useMemo(
    () => `"${getUrlOrigin(error)}" - ${getDescription(error)}`,
    [error],
  );

  const details = useMemo(
    () => getDetailPairs(error),
    [error],
  );

  const location = useMemo(
    () => getOrigin(error),
    [error],
  );

  const { goBack, replace } = useHistory();

  const hasLoginChallenge = useMemo(
    () => !isNil(loginChallenge),
    [loginChallenge],
  );

  const hasApiError = useMemo(
    () => !isNil(code),
    [code],
  );

  const hasFlowError = useMemo(
    () => !isNil(errorCode),
    [errorCode],
  );

  const isDev = useMemo(
    () => window.env.ENV === 'development',
    [],
  );

  const primary = useMemo(
    () => ({
      text: t('common:retry'),
      href: resetAuthHref,
    }),
    [t, resetAuthHref],
  );

  const secondary = useMemo(
    () => ({
      text: t('common:goBack'),
      onClick: goBack,
    }),
    [t, goBack],
  );

  const title = useMemo(
    () => {
      if (hasApiError && code === conflict) {
        return t('auth:error.title.conflict');
      }
      return t('auth:error.title.default');
    },
    [hasApiError, code, t],
  );

  const subtitle = useMemo(
    () => {
      if (hasFlowError) {
        return t(`auth:error.flow.${errorCode}`);
      }
      if (hasApiError) {
        return t('auth:error.api');
      }
      if (!hasLoginChallenge) {
        return t('auth:error.flow.missing_parameter', { parameter: 'login_challenge' });
      }
      return t('auth:error.unknown');
    },
    [hasFlowError, errorCode, hasApiError, hasLoginChallenge, t],
  );

  const onSignOutSuccess = useCallback(
    () => {
      replace(routes._);
    },
    [replace],
  );

  return (
    <Screen
      classes={{ content: classes.screenContent }}
    >
      <Container maxWidth="md" className={classes.container}>
        <Title>
          {title}
        </Title>
        <Subtitle>{subtitle}</Subtitle>
        {isAuthenticated && (
          <Box py={2} display="flex" alignItems="center">
            <Box mr={2}>
              <Subtitle gutterBottom={false}>{t('auth:error.alreadyAuth')}</Subtitle>
            </Box>
            {showCard ? ( // @FIXME replace by card user when implemented
              <CardUserSignOut
                onSuccess={onSignOutSuccess}
              />
            ) : (
              <ButtonSignOut
                standing={BUTTON_STANDINGS.OUTLINED}
                onSuccess={onSignOutSuccess}
              />
            )}
          </Box>
        )}
        {isDev && hasApiError && (
          <Box py={2}>
            <Alert severity="info">
              <AlertTitle>{t('auth:error.dev')}</AlertTitle>
              <AuthErrorDetails
                code={errorCode || code}
                description={errorDescription || description}
                details={details}
                location={errorLocation || location}
              />
            </Alert>
          </Box>
        )}
        {hasFlowError && (
          <AuthErrorDetails
            code={errorCode}
            description={errorDescription}
            location={errorLocation}
          />
        )}
        <BoxControls
          primary={primary}
          secondary={secondary}
        />
      </Container>
    </Screen>
  );
};

AuthError.propTypes = {
  loginChallenge: PropTypes.string,
  error: PropTypes.object,
  t: PropTypes.func.isRequired,
};

AuthError.defaultProps = {
  loginChallenge: null,
  error: null,
};


export default withTranslation(['auth', 'common'])(AuthError);
