import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';

import { useMemo, useCallback, useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import changeBoxInvitationLink from '@misakey/crypto/store/actions/changeBoxInvitationLink';
import logSentryException from '@misakey/core/helpers/log/sentry/exception';
import { combineBoxKeyShares, fetchMisakeyKeyShare } from '@misakey/crypto/box/keySplitting';
import { selectors } from '@misakey/crypto/store/reducers';
import { InvalidHash } from '@misakey/crypto/Errors/classes';
import setBoxSecrets from '@misakey/crypto/store/actions/setBoxSecrets';

// SELECTORS
const {
  makeGetAsymSecretKey,
  makeGetBoxKeyShare,
} = selectors;

export default (box, boxIsReady, belongsToCurrentUser) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [isBuildingSecretKey, setIsBuildingSecretKey] = useState(false);

  const { t } = useTranslation('boxes');

  const { enqueueSnackbar } = useSnackbar();
  const { pathname, hash: locationHash, search } = useLocation();

  const { id: boxId, publicKey, hasAccess, isMember } = useSafeDestr(box);

  const getAsymSecretKey = useMemo(
    () => makeGetAsymSecretKey(),
    [],
  );
  const secretKey = useSelector((state) => getAsymSecretKey(state, publicKey));

  const isAllowedToFetch = useMemo(
    () => Boolean(boxIsReady && hasAccess && isMember !== false),
    [boxIsReady, hasAccess, isMember],
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

  // We know for sure if users has all the information to check if they have the secretKey
  // We need to know publicKey of the box to known if user has corresponding secretKey
  const userHasBoxSecretKey = useMemo(
    () => !isNil(secretKey) && !isNil(publicKey),
    [publicKey, secretKey],
  );

  const shouldRebuildSecretKey = useMemo(
    () => !userHasBoxSecretKey,
    [userHasBoxSecretKey],
  );

  const shouldCheckStoredKeyShare = useMemo(
    () => !isNil(keyShareInStore) && shouldRebuildSecretKey && isAllowedToFetch,
    [keyShareInStore, shouldRebuildSecretKey, isAllowedToFetch],
  );

  const shouldCheckUrlKeyShare = useMemo(
    () => !isNil(keyShareInUrl) && isNil(keyShareInStore) && isAllowedToFetch,
    [keyShareInUrl, keyShareInStore, isAllowedToFetch],
  );

  const shouldCreateNewShares = useMemo(
    () => userHasBoxSecretKey && belongsToCurrentUser
      // if no box key share is found in secret storage nor url:
      // - it's a new chat so we should create new urlKeyShare
      // - something wrong happens to box creator crypto (it should not)
      // and creator should always have the ability to share its box
      && isNil(keyShareInUrl) && isNil(keyShareInStore),
    [userHasBoxSecretKey, keyShareInUrl, keyShareInStore, belongsToCurrentUser],
  );

  const shouldOnlyReplaceUrlHash = useMemo(
    () => !shouldCheckStoredKeyShare && isNil(keyShareInUrl) && !isNil(keyShareInStore),
    [keyShareInStore, shouldCheckStoredKeyShare, keyShareInUrl],
  );

  const fetchMisakeyKeyShareFromKeyShareInUrl = useCallback(
    () => fetchMisakeyKeyShare(keyShareInUrl), [keyShareInUrl],
  );

  const fetchMisakeyKeyShareFromKeyShareInStore = useCallback(
    () => fetchMisakeyKeyShare(keyShareInStore), [keyShareInStore],
  );

  const rebuildSecretKey = useCallback(async (misakeyKeyShare, invitationKeyShare) => {
    try {
      setIsBuildingSecretKey(true);
      await dispatch(setBoxSecrets({
        secretKey: combineBoxKeyShares(invitationKeyShare, misakeyKeyShare),
      }));
      setIsBuildingSecretKey(false);
    } catch (error) {
      enqueueSnackbar(t('boxes:create.error.updateSecretStorage'), { variant: 'error' });
      logSentryException(error, 'rebuilding secret key', { crypto: true });
    }
  }, [dispatch, enqueueSnackbar, t]);

  const setKeyShareInURL = useCallback(
    (keyShare) => { history.replace({ pathname, search, hash: `#${keyShare}` }); },
    [history, pathname, search],
  );

  const removeHash = useCallback(
    () => { history.replace({ pathname, search }); },
    [history, pathname, search],
  );

  const createNewBoxKeyShares = useCallback(
    async () => {
      await dispatch(changeBoxInvitationLink({ boxId, publicKey }));
    },
    [boxId, dispatch, publicKey],
  );

  const onSuccess = useCallback(
    async (misakeyKeyShare, invitationKeyShare) => {
      if (shouldRebuildSecretKey) { await rebuildSecretKey(misakeyKeyShare, invitationKeyShare); }
    },
    [rebuildSecretKey, shouldRebuildSecretKey],
  );

  const onStoredKeyShareValid = useCallback(
    ({ misakeyKeyShare, invitationKeyShare }) => {
      onSuccess(misakeyKeyShare, invitationKeyShare);
      if (isNil(keyShareInUrl) || keyShareInUrl !== invitationKeyShare) {
        setKeyShareInURL(invitationKeyShare);
      }
    },
    [onSuccess, setKeyShareInURL, keyShareInUrl],
  );

  const onStoredKeyShareInvalid = useCallback(
    () => {
      const error = new Error('stored box key share seems invalid');
      logSentryException(error, 'stored box key share invalid', { crypto: true });
    },
    [],
  );

  const onUrlKeyShareValid = useCallback(
    ({ misakeyKeyShare, invitationKeyShare }) => {
      try {
        const params = {
          boxId,
          keyShare: invitationKeyShare,
        };
        if (shouldRebuildSecretKey) {
          params.secretKey = combineBoxKeyShares(invitationKeyShare, misakeyKeyShare);
        }
        return Promise.resolve(dispatch(setBoxSecrets(params)));
      } catch (error) {
        enqueueSnackbar(t('boxes:create.error.updateSecretStorage'), { variant: 'error' });
        logSentryException(error, 'rebuilding box secret key', { crypto: true });
        return Promise.resolve();
      }
    },
    [boxId, dispatch, shouldRebuildSecretKey, enqueueSnackbar, t],
  );

  const onUrlKeyShareInvalid = useCallback(
    (err) => {
      if (err instanceof InvalidHash) {
        enqueueSnackbar(t('boxes:read.errors.invalid'), { variant: 'warning' });
        logSentryException(err, 'box key share in url is invalid', { crypto: true });
        removeHash();
      }
    },
    [enqueueSnackbar, t, removeHash],
  );

  // If box key share is found in secret storage, check its validity in backend
  // and put it in url. It will also rebuild the secretKey if needed.
  // If box key share is invalid, it is removed from secret storage
  // This will only happen for users with an account and a crypto secret storage
  const { isFetching: isFetchingKeyShareUsingStore } = useFetchEffect(
    fetchMisakeyKeyShareFromKeyShareInStore,
    { shouldFetch: shouldCheckStoredKeyShare },
    { onSuccess: onStoredKeyShareValid, onError: onStoredKeyShareInvalid },
  );

  // If no (or invalid) box key share is found in secret storage but box key share is found in url,
  // check its validity in backend
  // and store the share in secret storage if user has a secret storage.
  // It will also rebuild the secretKey if needed.
  // If box key share is invalid, PasteLink screen will be displayed
  // This can happen for user with or without account.
  const { isFetching: isFetchingUrlKeyShare } = useFetchEffect(
    fetchMisakeyKeyShareFromKeyShareInUrl,
    { shouldFetch: shouldCheckUrlKeyShare },
    { onSuccess: onUrlKeyShareValid, onError: onUrlKeyShareInvalid },
  );

  // If no valid box key share is found in url or secret storage and user is the creator,
  // recreate a pair of shares and store one in backend and the other in secret storage
  // and/or url (according to account state)
  const { isFetching: isCreatingNewShares } = useFetchEffect(
    createNewBoxKeyShares,
    { shouldFetch: shouldCreateNewShares },
  );

  // If there is a box key share in secret storage and we already checked box key share validity
  // in a satisfying time interval but urlHash is empty,
  // put box key share from secret storage in url hash
  // This case happen when users navigate between their boxes with boxes list
  useEffect(() => {
    if (shouldOnlyReplaceUrlHash) {
      setKeyShareInURL(keyShareInStore);
    }
  }, [keyShareInStore, setKeyShareInURL, shouldOnlyReplaceUrlHash]);

  return useMemo(
    () => ({
      isReady: (!isFetchingKeyShareUsingStore && !isFetchingUrlKeyShare && !isBuildingSecretKey),
      isCreatingNewShares,
      secretKey,
    }),
    [isBuildingSecretKey, isCreatingNewShares, isFetchingKeyShareUsingStore,
      isFetchingUrlKeyShare, secretKey],
  );
};
