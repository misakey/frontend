import { CLOSED } from 'constants/app/boxes/statuses';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';

import { useMemo, useCallback, useEffect, useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import { addBoxSecretKey, setBoxKeyShare, boxAddSecretKeySetKeyShare } from '@misakey/crypto/store/actions/concrete';
import { createKeyShareBuilder } from '@misakey/helpers/builder/boxes';
import { combineBoxKeyShares, splitBoxSecretKey } from '@misakey/crypto/box/keySplitting';
import checkHashValidity from '@misakey/crypto/helpers/checkHashValidity';
import { selectors } from '@misakey/crypto/store/reducers';
import { InvalidHash } from '@misakey/crypto/Errors/classes';
import useBoxBelongsToCurrentUser from 'hooks/useBoxBelongsToCurrentUser';
import useBoxPublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/useBoxPublicKeysWeCanDecryptFrom';

// SELECTORS
const { makeGetBoxKeyShare } = selectors;

export default (box, boxIsReady) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [isBuildingSecretKey, setIsBuildingSecretKey] = useState(false);

  const { t } = useTranslation('boxes');

  const { enqueueSnackbar } = useSnackbar();
  const { pathname, hash, search } = useLocation();

  const { id: boxId, lifecycle, publicKey, hasAccess, isMember } = useSafeDestr(box);

  const publicKeysWeCanDecryptFrom = useBoxPublicKeysWeCanDecryptFrom();
  const secretKey = useMemo(
    () => publicKeysWeCanDecryptFrom.get(publicKey),
    [publicKey, publicKeysWeCanDecryptFrom],
  );

  const belongsToCurrentUser = useBoxBelongsToCurrentUser(box);

  const isBoxClosed = useMemo(
    () => lifecycle === CLOSED,
    [lifecycle],
  );

  const isAllowedToFetch = useMemo(
    () => Boolean(boxIsReady && !isBoxClosed && hasAccess && isMember !== false),
    [boxIsReady, hasAccess, isBoxClosed, isMember],
  );

  const urlKeyShareHash = useMemo(() => (isEmpty(hash) ? null : hash.substr(1)), [hash]);
  const getBoxKeyShare = useMemo(() => makeGetBoxKeyShare(), []);
  // backupKeyShareHash is an object to allow to put some extra information later,
  // such as expirationDate
  const { value: backupKeyShareHash } = useSelector((state) => getBoxKeyShare(state, boxId) || {});

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

  const shouldCheckBackupKeyShare = useMemo(
    () => !isNil(backupKeyShareHash) && shouldRebuildSecretKey && isAllowedToFetch,
    [backupKeyShareHash, shouldRebuildSecretKey, isAllowedToFetch],
  );

  const shouldCheckUrlKeyShare = useMemo(
    () => !isNil(urlKeyShareHash) && isNil(backupKeyShareHash) && isAllowedToFetch,
    [urlKeyShareHash, backupKeyShareHash, isAllowedToFetch],
  );

  const shouldCreateNewShares = useMemo(
    () => userHasBoxSecretKey && belongsToCurrentUser
      // if no keyShareHash is found in user backup nor url:
      // - it's a new chat so we should create new urlKeyShare
      // - something wrong happens to box creator crypto (it should not)
      // and creator should always have the ability to share its box
      && isNil(urlKeyShareHash) && isNil(backupKeyShareHash),
    [userHasBoxSecretKey, urlKeyShareHash, backupKeyShareHash, belongsToCurrentUser],
  );

  const shouldOnlyReplaceUrlHash = useMemo(
    () => !shouldCheckBackupKeyShare && isNil(urlKeyShareHash) && !isNil(backupKeyShareHash),
    [backupKeyShareHash, shouldCheckBackupKeyShare, urlKeyShareHash],
  );

  const checkUrlKeyShareValidity = useCallback(
    () => checkHashValidity(urlKeyShareHash), [urlKeyShareHash],
  );

  const checkBackupKeyShareValidity = useCallback(
    () => checkHashValidity(backupKeyShareHash), [backupKeyShareHash],
  );

  const rebuildSecretKey = useCallback((misakeyKeyShare, otherKeyShare) => {
    try {
      setIsBuildingSecretKey(true);
      const newSecretKey = combineBoxKeyShares(otherKeyShare, misakeyKeyShare);
      return Promise.resolve(dispatch(addBoxSecretKey(newSecretKey)))
        .then(() => setIsBuildingSecretKey(false));
    } catch (error) {
      enqueueSnackbar(t('boxes:create.dialog.error.updateBackup'), { variant: 'error' });
      return Promise.resolve();
    }
  }, [dispatch, enqueueSnackbar, t]);

  const replaceHash = useCallback(
    (shareHash) => { history.replace({ pathname, search, hash: `#${shareHash}` }); },
    [history, pathname, search],
  );

  const removeHash = useCallback(
    () => { history.replace({ pathname, search }); },
    [history, pathname, search],
  );

  const saveKeyShareInBackup = useCallback(
    (value) => {
      dispatch(setBoxKeyShare({ boxId, keyShare: { value } }));
    },
    [boxId, dispatch],
  );

  const createNewBoxKeyShares = useCallback(
    () => {
      const { invitationKeyShare, misakeyKeyShare } = splitBoxSecretKey(secretKey, { boxId });
      return createKeyShareBuilder(misakeyKeyShare)
        .then(() => {
          saveKeyShareInBackup(invitationKeyShare);
          replaceHash(invitationKeyShare);
        });
    },
    [boxId, replaceHash, saveKeyShareInBackup, secretKey],
  );

  const onSuccess = useCallback(
    async (misakeyKeyShare, otherKeyShare) => {
      if (shouldRebuildSecretKey) { await rebuildSecretKey(misakeyKeyShare, otherKeyShare); }
    },
    [rebuildSecretKey, shouldRebuildSecretKey],
  );

  const onBackupKeyShareValid = useCallback(
    ({ misakeyKeyShare, otherShareHash }) => {
      onSuccess(misakeyKeyShare, otherShareHash);
      if (isNil(urlKeyShareHash) || urlKeyShareHash !== otherShareHash) {
        replaceHash(otherShareHash);
      }
    },
    [onSuccess, replaceHash, urlKeyShareHash],
  );

  const onBackupKeyShareInvalid = useCallback(
    () => {
      dispatch(setBoxKeyShare({ boxId, keyShare: null }));
    },
    [boxId, dispatch],
  );

  const onUrlKeyShareValid = useCallback(
    ({ misakeyKeyShare, otherShareHash }) => {
      try {
        const params = {
          boxId,
          keyShare: { value: otherShareHash },
        };
        if (shouldRebuildSecretKey) {
          const newSecretKey = combineBoxKeyShares(otherShareHash, misakeyKeyShare);
          params.newSecretKey = newSecretKey;
        }
        return Promise.resolve(dispatch(boxAddSecretKeySetKeyShare(params)));
      } catch (error) {
        enqueueSnackbar(t('boxes:create.dialog.error.updateBackup'), { variant: 'error' });
        return Promise.resolve();
      }
    },
    [boxId, dispatch, shouldRebuildSecretKey, enqueueSnackbar, t],
  );

  const onUrlKeyShareInvalid = useCallback(
    (err) => {
      if (err instanceof InvalidHash) {
        enqueueSnackbar(t('boxes:read.errors.incorrectLink'), { variant: 'warning' });
        removeHash();
      }
    },
    [enqueueSnackbar, t, removeHash],
  );

  // If hashKeyShare is found in backup, check its validity in backend
  // and put it in url. It will also rebuild the secretKey if needed.
  // If hashKeyShare is invalid, it is removed from backup
  // This will only happen for users with an account and a crypto backup
  const { isFetching: isFetchingBackupKeyShare } = useFetchEffect(
    checkBackupKeyShareValidity,
    { shouldFetch: shouldCheckBackupKeyShare },
    { onSuccess: onBackupKeyShareValid, onError: onBackupKeyShareInvalid },
  );

  // If no (or invalid) hashKeyShare is found in backup but hashKeyShare is found in url,
  // check its validity in backend and store the share in backup if user has a backup.
  // It will also rebuild the secretKey if needed.
  // If hashKeyShare is invalid, PasteLink screen will be displayed
  // This can happen for user with or without account.
  const { isFetching: isFetchingUrlKeyShare } = useFetchEffect(
    checkUrlKeyShareValidity,
    { shouldFetch: shouldCheckUrlKeyShare },
    { onSuccess: onUrlKeyShareValid, onError: onUrlKeyShareInvalid },
  );

  // If no valid hashKeyShare is found in url or backup and user is the creator,
  // recreate a pair of shares and store one in backend and the other in backup
  // and/or url (according to account state)
  const { isFetching: isCreatingNewShares } = useFetchEffect(
    createNewBoxKeyShares,
    { shouldFetch: shouldCreateNewShares },
  );

  // If there is a hashKeyShare in backup and we already checked hashKeyShare validity
  // in a satisfying time interval but urlHash is empty, put hashKeyShare from backup in url hash
  // This case happen when users navigate between their boxes with boxes list
  useEffect(() => {
    if (shouldOnlyReplaceUrlHash) {
      replaceHash(backupKeyShareHash);
    }
  }, [backupKeyShareHash, replaceHash, shouldOnlyReplaceUrlHash]);

  return useMemo(
    () => ({
      isReady: (!isFetchingBackupKeyShare && !isFetchingUrlKeyShare && !isBuildingSecretKey),
      isCreatingNewShares,
      secretKey,
    }),
    [isBuildingSecretKey, isCreatingNewShares, isFetchingBackupKeyShare,
      isFetchingUrlKeyShare, secretKey],
  );
};
