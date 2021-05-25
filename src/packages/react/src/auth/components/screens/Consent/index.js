import React, { useMemo, useCallback, useEffect, useReducer, useContext, Suspense } from 'react';

import { useTranslation } from 'react-i18next';

import { selectors as ssoSelectors } from '@misakey/react/auth/store/reducers/sso';
import { selectors as cryptoSelectors } from '@misakey/react/crypto/store/reducers';
import { MISAKEY_CONSENT_SCOPES, CONSENT_TYPE_DATATAG, CONSENTED_SCOPES_KEY } from '@misakey/core/auth/constants/consent';

import objectToCamelCase from '@misakey/core/helpers/objectToCamelCase';
import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';
import redirect from '@misakey/core/helpers/redirect';
import partition from '@misakey/core/helpers/partition';
import { getDetails } from '@misakey/core/helpers/apiError';
import { consent } from '@misakey/core/auth/builder/consent';
import { handleKeysForConsent } from '@misakey/core/crypto/consentKeys';
import { hasConsentDataScope } from '@misakey/core/helpers/scope';

import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';
import useConsentChallenge from '@misakey/react/auth/hooks/useConsentChallenge';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useGetConsentInfo from '@misakey/hooks/useGetConsentInfo';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import usePropChanged from '@misakey/hooks/usePropChanged';
import useShouldDisplayLockedScreenSso from '@misakey/hooks/useShouldDisplayLockedScreen/sso';
import useLoadSecretsFromSharesSso from '@misakey/react/crypto/hooks/useLoadSecretsFromShares/sso';
import useClearIdentity from '@misakey/react/auth/hooks/useClearIdentity';
import useIsMountedRef from '@misakey/hooks/useIsMountedRef';

import CardRequestedConsentOrganization from '@misakey/react/auth/components/Card/RequestedConsent/Organization';
import CardRequestedConsentMisakey from '@misakey/react/auth/components/Card/RequestedConsent/Misakey';
import SplashScreenWithTranslation from '@misakey/ui/Screen/Splash/WithTranslation';
import ScreenLockedConsent from '@misakey/ui/Screen/Locked/Consent';
import AvatarClientSso from '@misakey/ui/Avatar/Client/Sso';
import ButtonForgotPasswordRedirect from '@misakey/react/auth/components/Button/ForgotPassword/Redirect';
import { UserManagerContext } from '@misakey/react/auth/components/OidcProvider/Context';

// CONSTANTS
const {
  client: CLIENT_SELECTOR,
  subjectIdentity: SUBJECT_IDENTITY_SELECTOR,
  requestedConsents: REQUESTED_CONSENTS_SELECTOR,
  requestUrl: REQUEST_URL_SELECTOR,
  acr: ACR_SELECTOR,
  scope: SCOPE_SELECTOR,
} = ssoSelectors;

const {
  getAsymKeys,
} = cryptoSelectors;

const INITIAL_STATE = {
  step: 0,
  scopes: [],
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
  const { isLoadingRootKey, isReady } = useLoadSecretsFromSharesSso();

  const isMountedRef = useIsMountedRef();

  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();
  const { t } = useTranslation('auth');
  const { userManager } = useContext(UserManagerContext);

  const onClearIdentity = useClearIdentity();

  const consentChallenge = useConsentChallenge();

  const client = useSelector(CLIENT_SELECTOR);
  const { publicKey } = useSafeDestr(client);
  const subjectIdentity = useSelector(SUBJECT_IDENTITY_SELECTOR);
  const { id: identityId, identifierValue, hasCrypto } = useSafeDestr(subjectIdentity);
  const requestedConsents = useSelector(REQUESTED_CONSENTS_SELECTOR);
  const acr = useSelector(ACR_SELECTOR);
  const requestUrl = useSelector(REQUEST_URL_SELECTOR);
  const asymKeys = useSelector(getAsymKeys);
  const scope = useSelector(SCOPE_SELECTOR);
  const hasDataConsentScope = useMemo(
    () => hasConsentDataScope(scope),
    [scope],
  );

  const shouldDisplayLockedScreen = useShouldDisplayLockedScreenSso();

  const [misakeyConsents, otherConsents] = useMemo(
    () => partition(
      requestedConsents,
      ({ scope: consentScope }) => MISAKEY_CONSENT_SCOPES.includes(consentScope),
    ),
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
    () => (step === 0 ? misakeyNeededConsents : groupedByOrgConsents[step]),
    [groupedByOrgConsents, misakeyNeededConsents, step],
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
      ...handleKeysForConsent({
        acceptedRequestedConsents: scopes,
        asymKeysMapping: asymKeys,
        consumerPublicKey: publicKey,
      }),
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
      }).finally(() => {
        // in case step is nil, there is no formikBag holding setSubmitting
        // it happens with scope=no_legal
        if (isMountedRef.current && !isNil(setSubmitting)) {
          setSubmitting(false);
        }
      }),
    [
      acr, identityId, consentChallenge, scopes, asymKeys, publicKey,
      handleHttpErrors, enqueueSnackbar, t, isMountedRef, setSubmitting,
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
      if (!isNil(nextStep) && isMountedRef.current) {
        formikBag.setSubmitting(false);
      }
    },
    [isMountedRef, nextStep, onNext],
  );

  const handleSignOut = useCallback(
    async () => {
      await onClearIdentity();
      await userManager.signinRedirect({
        referrer: requestUrl,
        prompt: 'login',
        misakeyCallbackHints: { shouldCreateAccount: true, canSkipCreation: !hasDataConsentScope },
      });
    },
    [hasDataConsentScope, onClearIdentity, requestUrl, userManager],
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

  const shouldUpdateStep = useMemo(
    () => consentInfoReady && !showMisakeyConsent && step === 0,
    [consentInfoReady, showMisakeyConsent, step],
  );

  useUpdateDocHead(t('auth:consent.documentTitle'));

  useEffect(
    () => {
      if (hasDataConsentScope && hasCrypto === false) {
        userManager.signinRedirect({
          misakeyCallbackHints: { shouldCreateAccount: true, canSkipCreation: false },
          referrer: requestUrl,
        });
      }
    },
    [hasCrypto, hasDataConsentScope, requestUrl, scope, userManager],
  );

  useEffect(
    () => {
      if (shouldUpdateStep) {
        onNext([]);
      }
      if (isNil(step)) {
        onConsent();
      }
    },
    [consentInfoReady, onConsent, onNext, onSubmit, shouldUpdateStep, showMisakeyConsent, step],
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

  if (!consentInfoReady || (shouldUpdateStep) || isLoadingRootKey || !isReady) {
    return <SplashScreenWithTranslation />;
  }

  if (shouldDisplayLockedScreen) {
    return (
      <ScreenLockedConsent
        onSignOut={handleSignOut}
        avatar={(
          <AvatarClientSso
            client={client}
          />
        )}
        secondary={(
          <ButtonForgotPasswordRedirect
            text={t('auth:login.form.action.forgotPassword')}
            identifier={identifierValue}
            referrer={requestUrl}
          />
        )}
      />
    );
  }

  if (step === 0) {
    return (
      <CardRequestedConsentMisakey
        client={client}
        onSubmit={onSubmit}
        isFetching={isFetching}
        consents={currentStepConsent}
        onSignOut={handleSignOut}
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
          onSignOut={handleSignOut}
        />
      </Suspense>
    );
  }
  return null;
};

export default AuthConsent;
