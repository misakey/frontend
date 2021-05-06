import React, { useMemo, useCallback, useEffect, useReducer, Suspense } from 'react';

import { useTranslation } from 'react-i18next';

import { selectors as ssoSelectors } from '@misakey/react/auth/store/reducers/sso';
import { MISAKEY_CONSENT_SCOPES, CONSENT_TYPE_DATATAG, CONSENTED_SCOPES_KEY } from '@misakey/core/auth/constants/consent';


import objectToCamelCase from '@misakey/core/helpers/objectToCamelCase';
import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';
import redirect from '@misakey/core/helpers/redirect';
import partition from '@misakey/core/helpers/partition';
import { getDetails } from '@misakey/core/helpers/apiError';
import { consent } from '@misakey/core/auth/builder/consent';

import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';
import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useGetConsentInfo from '@misakey/hooks/useGetConsentInfo';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import usePropChanged from '@misakey/hooks/usePropChanged';

import CardRequestedConsentOrganization from '@misakey/react/auth/components/Card/RequestedConsent/Organization';
import CardRequestedConsentMisakey from '@misakey/react/auth/components/Card/RequestedConsent/Misakey';
import SplashScreenWithTranslation from '@misakey/ui/Screen/Splash/WithTranslation';

// CONSTANTS
const {
  client: CLIENT_SELECTOR,
  subjectIdentity: SUBJECT_IDENTITY_SELECTOR,
  requestedConsents: REQUESTED_CONSENTS_SELECTOR,
  acr: ACR_SELECTOR,
} = ssoSelectors;

const INITIAL_STATE = {
  step: 0,
  scopes: ['openid'],
  formikBag: {},
};
const CONSENT = Symbol('CONSENT');
const RESET = Symbol('RESET');

// HELPERS
const consentReducer = (state, { type, step, scopes, formikBag }) => {
  if (type === CONSENT) {
    return {
      ...state,
      step,
      scopes: [...state.scopes, ...scopes],
      formikBag,
    };
  }
  if (type === RESET) {
    return INITIAL_STATE;
  }
  return state;
};

// COMPONENTS
const AuthConsent = () => {
  const [{
    step,
    scopes,
    formikBag: { setSubmitting },
  }, dispatch] = useReducer(consentReducer, INITIAL_STATE);
  const [stepChanged, resetStepChanged] = usePropChanged(step);

  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();
  const { t } = useTranslation('auth');

  const searchParams = useLocationSearchParams(objectToCamelCase);

  const { consentChallenge } = useSafeDestr(searchParams);

  const client = useSelector(CLIENT_SELECTOR);
  const subjectIdentity = useSelector(SUBJECT_IDENTITY_SELECTOR);
  const { id: identityId } = useSafeDestr(subjectIdentity);
  const requestedConsents = useSelector(REQUESTED_CONSENTS_SELECTOR);
  const acr = useSelector(ACR_SELECTOR);

  const [misakeyConsents, otherConsents] = useMemo(
    () => partition(requestedConsents, ({ scope }) => MISAKEY_CONSENT_SCOPES.includes(scope)),
    [requestedConsents],
  );

  const misakeyNeededConsents = useMemo(
    () => misakeyConsents.filter(({ alreadyConsented }) => alreadyConsented === false),
    [misakeyConsents],
  );

  const showMisakeyConsent = useMemo(
    () => !isEmpty(misakeyNeededConsents),
    [misakeyNeededConsents],
  );

  const datatagConsents = useMemo(
    () => otherConsents.filter(({ type }) => type === CONSENT_TYPE_DATATAG),
    [otherConsents],
  );

  const groupedByOrgConsents = useMemo(
    () => datatagConsents
      .reduce((aggr, orgConsent) => {
        const { details } = orgConsent;
        const { producerOrganization } = details;
        const { id } = producerOrganization;
        const consentsByOrg = aggr[id];
        if (isNil(consentsByOrg)) {
          return {
            ...aggr,
            [id]: {
              organization: producerOrganization,
              consents: [orgConsent],
            },
          };
        }
        return {
          ...aggr,
          [id]: {
            ...consentsByOrg,
            consents: [...consentsByOrg.consents, orgConsent],
          },
        };
      },
      {}),
    [datatagConsents],
  );

  const currentStepConsent = useMemo(
    () => (step === 0 ? {} : groupedByOrgConsents[step]),
    [groupedByOrgConsents, step],
  );

  const consentKeys = useMemo(
    () => (showMisakeyConsent
      ? [0, ...Object.keys(groupedByOrgConsents)]
      : Object.keys(groupedByOrgConsents)),
    [groupedByOrgConsents, showMisakeyConsent],
  );

  const currentStepIndex = useMemo(
    () => consentKeys.findIndex((consentKey) => consentKey === step),
    [consentKeys, step],
  );
  const nextStep = useMemo(
    () => consentKeys[currentStepIndex + 1],
    [consentKeys, currentStepIndex],
  );

  const getConsentInfo = useGetConsentInfo(consentChallenge);

  const onConsent = useCallback(
    () => consent({
      acr,
      subjectIdentityId: identityId,
      consentChallenge,
      [CONSENTED_SCOPES_KEY]: scopes,
    })
      .then((response) => {
        const { redirectTo: nextRedirectTo } = objectToCamelCase(response);
        return redirect(nextRedirectTo);
      })
      .catch((e) => {
        const details = getDetails(e);
        if (!isNil(details.consentedLegalScope) || !isNil(details.requestedLegalScope)) {
          return enqueueSnackbar(t('auth:consent.error', { variant: 'error' }));
        }
        return handleHttpErrors(e);
      }).finally(() => { setSubmitting(false); }),
    [
      acr, consentChallenge, identityId, scopes,
      enqueueSnackbar, handleHttpErrors, setSubmitting, t,
    ],
  );

  const onNext = useCallback(
    (consentedScopes, formikBag = {}) => dispatch({
      type: CONSENT,
      scopes: consentedScopes,
      step: nextStep,
      formikBag,
    }),
    [nextStep],
  );

  const onSubmit = useCallback(
    ({ [CONSENTED_SCOPES_KEY]: consentedScopes }, formikBag) => {
      onNext(consentedScopes, formikBag);
      if (!isNil(nextStep)) {
        formikBag.setSubmitting(false);
      }
    },
    [nextStep, onNext],
  );

  const shouldFetch = useMemo(
    () => isNil(identityId),
    [identityId],
  );

  const { isFetching } = useFetchEffect(getConsentInfo, { shouldFetch });

  const consentInfoReady = useMemo(
    () => !isFetching && !shouldFetch,
    [isFetching, shouldFetch],
  );

  useUpdateDocHead(t('auth:consent.documentTitle'));

  useEffect(
    () => {
      if (consentInfoReady && !showMisakeyConsent && step === 0) {
        onNext([]);
      }
      if (isNil(step)) {
        onConsent();
      }
    },
    [consentInfoReady, onConsent, onNext, onSubmit, showMisakeyConsent, step],
  );

  useEffect(
    () => {
      if (stepChanged) {
        setTimeout(
          () => {
            resetStepChanged();
          },
          300,
        );
      }
    },
    [resetStepChanged, stepChanged],
  );

  if (!consentInfoReady || (consentInfoReady && !showMisakeyConsent && step === 0)) {
    return <SplashScreenWithTranslation />;
  }

  if (step === 0) {
    return (
      <CardRequestedConsentMisakey
        client={client}
        onSubmit={onSubmit}
        isFetching={isFetching}
      />
    );
  }
  if (!isNil(step)) {
    return (
      <Suspense fallback={<SplashScreenWithTranslation />}>
        <CardRequestedConsentOrganization
          client={client}
          {...currentStepConsent}
          subjectIdentity={subjectIdentity}
          onSubmit={onSubmit}
          isFetching={isFetching}
          stepChanged={stepChanged}
        />
      </Suspense>
    );
  }
  return null;
};

export default AuthConsent;
