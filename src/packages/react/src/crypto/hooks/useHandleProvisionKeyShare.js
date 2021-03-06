import addBoxesFromProvision from '@misakey/react/crypto/store/actions/addBoxesFromProvision';
import addConsentKey from '@misakey/react/crypto/store/actions/addConsentKey';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';
import isFunction from '@misakey/core/helpers/isFunction';
import promiseAllNoFailFast from '@misakey/core/helpers/promiseAllNoFailFast';
import { bulkJoinBoxes } from '@misakey/core/api/helpers/builder/identities';
import logSentryException from '@misakey/core/helpers/log/sentry/exception';
import { parseInvitationShare } from '@misakey/core/crypto/box/keySplitting';
import { processProvisionKeyShare } from '@misakey/core/crypto/provisions';

import { useMemo, useState, useCallback } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useDispatch, useSelector, batch } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useFetchEffect from '@misakey/hooks/useFetch/effect';

// SELECTORS
const {
  accountId: ACCOUNT_ID_SELECTOR,
  identityId: IDENTITY_ID_SELECTOR,
} = authSelectors;

// HOOKS
export default (isReady, onJoin) => {
  const dispatch = useDispatch();
  const { replace } = useHistory();

  const [provisionCount, setProvisionCount] = useState(null);

  const { t } = useTranslation('boxes');

  const { enqueueSnackbar } = useSnackbar();
  const { pathname, hash: locationHash, search } = useLocation();

  const accountId = useSelector(ACCOUNT_ID_SELECTOR);
  const identityId = useSelector(IDENTITY_ID_SELECTOR);

  // Note that the "hash" here is the "hash" part of the URL
  // (see https://developer.mozilla.org/en-US/docs/Web/API/URL/hash)
  // not to be confused with the output of a hash function.
  // It turns out that the value we get from the “URL hash” (the invitation key share)
  // will be passed through a hash function
  // (to compute the "invitation share hash"
  // with which we retrieve the corresponding Misakey key share)
  // so this can be a bit error-prone.
  const keyShareInUrl = useMemo(() => (
    isEmpty(locationHash)
      ? null
      : locationHash.substr(1)
  ), [locationHash]);

  const parsedInvitationShare = useMemo(
    () => (isNil(keyShareInUrl) ? null : parseInvitationShare(keyShareInUrl)),
    [keyShareInUrl],
  );
  const { type } = useSafeDestr(parsedInvitationShare);

  const isProvisionKeyShare = useMemo(
    () => type === 'provision',
    [type],
  );

  const shouldCheckUrlProvisionKeyShare = useMemo(
    () => (
      !isNil(parsedInvitationShare) && isProvisionKeyShare
      && isReady
    ),
    [isReady, parsedInvitationShare, isProvisionKeyShare],
  );

  const processProvisionKeyShareFromKeyShareInUrl = useCallback(
    async () => {
      setProvisionCount(null);
      const { boxesSecret, consentSecretKeys } = await processProvisionKeyShare(
        parsedInvitationShare.value,
        accountId,
      );

      if (isEmpty(boxesSecret)) {
        throw new Error('no boxes secrets retrieved from crypto provision');
      }
      setProvisionCount(boxesSecret.length);

      return { boxesSecret, consentSecretKeys };
    }, [accountId, parsedInvitationShare],
  );

  const clearKeyShareInURL = useCallback(
    () => { replace({ pathname, search, hash: '' }); },
    [pathname, replace, search],
  );

  const onProvisionKeyShareProcessed = useCallback(
    async ({ boxesSecret, consentSecretKeys }) => {
      // we join all boxes linked to the provision
      const boxesToJoin = boxesSecret.map(({ boxId: id }) => id);

      if (!isEmpty(boxesToJoin)) {
        const joined = await bulkJoinBoxes(identityId, boxesToJoin);
        if (isFunction(onJoin)) {
          await onJoin(joined);
        }
      }
      await dispatch(addBoxesFromProvision({ boxesSecret }));

      await batch(() => promiseAllNoFailFast(consentSecretKeys.map((consentSecretKey) => (
        dispatch(addConsentKey({ consentSecretKey }))
      ))));

      // once all boxes from provision are joined,
      // we clear provision hash from url
      clearKeyShareInURL();
    },
    [dispatch, clearKeyShareInURL, identityId, onJoin],
  );

  const onProvisionProcessingError = useCallback(
    (err) => {
      enqueueSnackbar(t('common:anErrorOccurred'), { variant: 'error' });
      logSentryException(err, 'processing crypto provision', { crypto: true });
    },
    [enqueueSnackbar, t],
  );

  const { isFetching: isProcessingProvisionKeyShare } = useFetchEffect(
    processProvisionKeyShareFromKeyShareInUrl,
    { shouldFetch: shouldCheckUrlProvisionKeyShare },
    { onSuccess: onProvisionKeyShareProcessed, onError: onProvisionProcessingError },
  );

  const done = useMemo(
    () => !isProcessingProvisionKeyShare,
    [isProcessingProvisionKeyShare],
  );

  return useMemo(
    () => ({
      shouldCheckUrlProvisionKeyShare,
      done,
      provisionCount,
    }),
    [
      shouldCheckUrlProvisionKeyShare,
      done,
      provisionCount,
    ],
  );
};
