import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';
import { useHistory, Link } from 'react-router-dom';

import { APPBAR_SPACING } from '@misakey/ui/constants/sizes';
import errorTypes from '@misakey/ui/constants/errorTypes';
import routes from 'routes';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import isNil from '@misakey/helpers/isNil';
import { getCode, getDescription, getUrlOrigin, getOrigin, getDetailPairs } from '@misakey/helpers/apiError';

import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';

import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Title from '@misakey/ui/Typography/Title';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import BoxControls from '@misakey/ui/Box/Controls';
import AuthErrorDetails from 'components/screens/Auth/Error/Details';

// CONSTANTS
const { conflict } = errorTypes;

// COMPONENTS
const AuthError = ({ loginChallenge, error, t }) => {
  const { errorCode, errorDescription, errorLocation } = useLocationSearchParams(objectToCamelCase);

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

  const { goBack } = useHistory();

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
      text: t('common:openVault'),
      component: Link,
      to: routes.auth.redirectToSignIn,
    }),
    [t],
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

  return (
    <Container maxWidth="md">
      <Box mt={2 * APPBAR_SPACING} display="flex" flexDirection="column" alignItems="center">
        <Title>
          {title}
        </Title>
        <Subtitle>{subtitle}</Subtitle>
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
      </Box>
    </Container>
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
