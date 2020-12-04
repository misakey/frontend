import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation, Trans } from 'react-i18next';
import * as Sentry from '@sentry/browser';
import { Link } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import { FEEDBACK } from 'constants/emails';
import { PROP_TYPES as SSO_PROP_TYPES } from '@misakey/auth/store/reducers/sso';
import { CONSENTED_SCOPES_KEY, CONSENT_SCOPES } from '@misakey/auth/constants/consent';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import { getDetails } from '@misakey/helpers/apiError';
import { consent } from '@misakey/auth/builder/consent';

import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useGetConsentInfo from '@misakey/hooks/useGetConsentInfo';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useNotDoneEffect from 'hooks/useNotDoneEffect';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Screen from '@misakey/ui/Screen';
import ListConsent from 'components/dumb/List/Consent';
import Title from '@misakey/ui/Typography/Title';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import BoxControls from '@misakey/ui/Box/Controls';
import Redirect from '@misakey/ui/Redirect';
import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import Alert from '@material-ui/lab/Alert';

import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';

// CONSTANTS
const INITIAL_VALUES = {
  [CONSENTED_SCOPES_KEY]: CONSENT_SCOPES,
};

// HOOKS
const useStyles = makeStyles(() => ({
  screenContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    overflow: 'auto',
  },
}));

// COMPONENTS
const AuthConsent = ({
  authnStep,
  client,
  t,
}) => {
  const classes = useStyles();
  const [redirectTo, setRedirectTo] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();

  const searchParams = useLocationSearchParams(objectToCamelCase);

  const { consentChallenge } = useSafeDestr(searchParams);

  const { identityId } = useSafeDestr(authnStep);

  const { id, tosUri, policyUri, name } = useSafeDestr(client);

  const hasMissingClientUris = useMemo(
    () => !isEmpty(id) && (isEmpty(tosUri) || isEmpty(policyUri)),
    [id, tosUri, policyUri],
  );

  const getConsentInfo = useGetConsentInfo(consentChallenge);

  const onSubmit = useCallback(
    (values, { setSubmitting }) => {
      setRedirectTo(null);
      return consent({ identityId, consentChallenge, ...values })
        .then((response) => {
          const { redirectTo: nextRedirectTo } = objectToCamelCase(response);
          setRedirectTo(nextRedirectTo);
        })
        .catch((e) => {
          const details = getDetails(e);
          if (!isNil(details.consentedLegalScope) || !isNil(details.requestedLegalScope)) {
            return enqueueSnackbar(t('auth:consent.error', { variant: 'error' }));
          }
          return handleHttpErrors(e);
        })
        .finally(() => { setSubmitting(false); });
    },
    [consentChallenge, enqueueSnackbar, handleHttpErrors, identityId, t],
  );

  const shouldFetch = useMemo(
    () => isNil(identityId),
    [identityId],
  );

  const { isFetching } = useFetchEffect(getConsentInfo, { shouldFetch });

  const primary = useMemo(() => ({ text: t('common:accept'), isLoading: isFetching }), [isFetching, t]);

  useNotDoneEffect(
    (onDone) => {
      if (hasMissingClientUris) {
        const missing = [];
        if (isEmpty(tosUri)) {
          missing.push('tos');
        }
        if (isEmpty(policyUri)) {
          missing.push('pp');
        }
        const errorMessage = `[missing consent link]: client ${name} - ${missing.join('|')}`;
        Sentry.captureMessage(errorMessage, 'error');
        onDone();
      }
    },
    [id, name, tosUri, policyUri],
  );

  useUpdateDocHead(t('auth:consent.documentTitle'));

  if (!isNil(redirectTo)) {
    return (
      <Redirect
        to={redirectTo}
        forceRefresh
        manualRedirectPlaceholder={(
          <Screen isLoading />
        )}
      />
    );
  }

  return (
    <Screen
      classes={{ content: classes.screenContent }}
    >
      <Container maxWidth="md" className={classes.container}>
        <Formik
          initialValues={INITIAL_VALUES}
          onSubmit={onSubmit}
        >
          <Box component={Form} display="flex" flexDirection="column">
            <Title>
              {t('auth:consent.title')}
            </Title>
            {hasMissingClientUris ? (
              <Alert severity="warning">
                <Trans i18nKey="auth:consent.missing">
                  Une erreur est survenue lors de votre inscription, merci de le signaler à
                  <Link href={`mailto:${FEEDBACK}`} color="inherit">{FEEDBACK}</Link>
                </Trans>
              </Alert>
            ) : (
              <>
                <ListConsent {...client} />
                <BoxControls
                  formik
                  primary={primary}
                />
              </>
            )}
          </Box>
        </Formik>
      </Container>
    </Screen>
  );
};

AuthConsent.propTypes = {
  // withTranslation
  t: PropTypes.func.isRequired,
  // CONNECT
  authnStep: SSO_PROP_TYPES.authnStep,
  client: SSO_PROP_TYPES.client,
};

AuthConsent.defaultProps = {
  authnStep: null,
  client: null,
};

// CONNECT
const mapStateToProps = (state) => ({
  authnStep: state.sso.authnStep,
  client: state.sso.client,
});


export default connect(mapStateToProps, {})(withTranslation(['auth', 'common'])(AuthConsent));
