import addBoxesFromProvision from '@misakey/react/crypto/store/actions/addBoxesFromProvision';
import { selectors } from '@misakey/react/crypto/store/reducers';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';
import isFunction from '@misakey/core/helpers/isFunction';
import { bulkJoinBoxes } from '@misakey/core/api/helpers/builder/identities';
import logSentryException from '@misakey/core/helpers/log/sentry/exception';
import { parseInvitationShare } from '@misakey/core/crypto/box/keySplitting';
import { processProvisionKeyShare } from '@misakey/core/crypto/provisions';

import { useMemo, useCallback } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

// SELECTORS
const {
  makeGetBoxKeyShare,
} = selectors;
const {
  accountId: ACCOUNT_ID_SELECTOR,
  identityId: IDENTITY_ID_SELECTOR,
} = authSelectors;

// HOOKS
export default (box, isReady, onJoin) => {
  const dispatch = useDispatch();
  const history = useHistory();


  const { t } = useTranslation('boxes');

  const { enqueueSnackbar } = useSnackbar();
  const { pathname, hash: locationHash, search } = useLocation();

  const { id: boxId, hasAccess, isMember } = useSafeDestr(box);

  const accountId = useSelector(ACCOUNT_ID_SELECTOR);
  const identityId = useSelector(IDENTITY_ID_SELECTOR);

  const isAllowedToFetch = useMemo(
    () => Boolean(isReady && hasAccess && isMember !== false),
    [isReady, hasAccess, isMember],
  );

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
  const getBoxKeyShare = useMemo(
    () => makeGetBoxKeyShare(),
    [],
  );
  const keyShareInStore = useSelector((state) => getBoxKeyShare(state, boxId));

  const parsedInvitationShare = useMemo(
    () => (isNil(keyShareInUrl) ? null : parseInvitationShare(keyShareInUrl)),
    [keyShareInUrl],
  );

  const isProvisionKeyShare = useMemo(
    () => (isNil(parsedInvitationShare) ? undefined : parsedInvitationShare.type === 'provision'),
    [parsedInvitationShare],
  );

  const shouldCheckUrlProvisionKeyShare = useMemo(
    () => (
      !isNil(parsedInvitationShare) && isProvisionKeyShare
      && isNil(keyShareInStore) && isAllowedToFetch
    ),
    [keyShareInStore, isAllowedToFetch, parsedInvitationShare, isProvisionKeyShare],
  );

  const processProvisionKeyShareFromKeyShareInUrl = useCallback(
    async () => {
      const boxesSecret = await processProvisionKeyShare(
        parsedInvitationShare.value,
        accountId,
      );

      if (isEmpty(boxesSecret)) {
        throw new Error('no boxes secrets retrieved from crypto provision');
      }

      return boxesSecret;
    }, [accountId, parsedInvitationShare],
  );

  const setKeyShareInURL = useCallback(
    (keyShare) => { history.replace({ pathname, search, hash: `#${keyShare}` }); },
    [history, pathname, search],
  );

  const onProvisionKeyShareProcessed = useCallback(
    async (boxesSecret) => {
      // the invitation key share of this box
      // (to change the URL to the “canonical” URL of the current box)
      let boxKeyShare;

      // we join all boxes linked to the provision
      // except the one corresponding to the URL
      // since this one is already joined.
      // XXX fragile; what about having the backend ignore “joins”
      // for boxes we already joined?
      const boxesToJoin = [];
      boxesSecret.forEach(({ boxId: id, keyShare }) => {
        if (id !== boxId) {
          boxesToJoin.push(id);
        } else {
          boxKeyShare = keyShare;
        }
      });

      if (!isEmpty(boxesToJoin)) {
        const joined = await bulkJoinBoxes(identityId, boxesToJoin);
        if (isFunction(onJoin)) {
          await onJoin(joined);
        }
      }
      await dispatch(addBoxesFromProvision({ boxesSecret }));

      // see above
      setKeyShareInURL(boxKeyShare);
    },
    [dispatch, setKeyShareInURL, boxId, identityId, onJoin],
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

  return useMemo(
    () => ({
      isReady: !isProcessingProvisionKeyShare,
    }),
    [
      isProcessingProvisionKeyShare,
    ],
  );
};
