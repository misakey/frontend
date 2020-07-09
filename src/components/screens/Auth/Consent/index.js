import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { PROP_TYPES as SSO_PROP_TYPES } from '@misakey/auth/store/reducers/sso';
import { CONSENTED_SCOPES_KEY, CONSENT_SCOPES } from '@misakey/auth/constants/consent';

import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import isNil from '@misakey/helpers/isNil';
import { getDetails } from '@misakey/helpers/apiError';
import { consent } from '@misakey/auth/builder/consent';

import { useSnackbar } from 'notistack';
import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useGetConsentInfo from '@misakey/hooks/useGetConsentInfo';
import useFetchEffect from '@misakey/hooks/useFetch/effect';

import ListConsent from '@misakey/auth/components/List/Consent';
import Title from '@misakey/ui/Typography/Title';
import Box from '@material-ui/core/Box';
import BoxControls from '@misakey/ui/Box/Controls';
import DefaultSplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import Redirect from 'components/dumb/Redirect';
import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';

// CONSTANTS
const INITIAL_VALUES = {
  [CONSENTED_SCOPES_KEY]: CONSENT_SCOPES,
};

// COMPONENTS
const AuthConsent = ({
  authnStep,
  t,
}) => {
  const [redirectTo, setRedirectTo] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();

  const searchParams = useLocationSearchParams(objectToCamelCase);

  const { consentChallenge } = useMemo(() => searchParams, [searchParams]);

  const { identityId } = useMemo(() => authnStep || {}, [authnStep]);


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

  if (!isNil(redirectTo)) {
    return (
      <Redirect
        to={redirectTo}
        forceRefresh
        manualRedirectPlaceholder={(
          <DefaultSplashScreen />
        )}
      />
    );
  }

  return (
    <Formik
      initialValues={INITIAL_VALUES}
      onSubmit={onSubmit}
    >
      <Box component={Form} display="flex" flexDirection="column" alignItems="center">
        <Title>
          {t('auth:consent.title')}
        </Title>
        <ListConsent />
        <BoxControls
          formik
          primary={primary}
        />
      </Box>
    </Formik>
  );
};

AuthConsent.propTypes = {
  // withTranslation
  t: PropTypes.func.isRequired,
  // CONNECT
  authnStep: SSO_PROP_TYPES.authnStep,
};

AuthConsent.defaultProps = {
  authnStep: null,
};

// CONNECT
const mapStateToProps = (state) => ({
  authnStep: state.sso.authnStep,
});


export default connect(mapStateToProps, {})(withTranslation(['auth', 'common'])(AuthConsent));
