import { useCallback, useMemo } from 'react';
import { useLocation, generatePath } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import copy from '@misakey/helpers/copy';
import useBoxPublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/useBoxPublicKeysWeCanDecryptFrom';
import { isDesktopDevice } from '@misakey/helpers/devices';
import isNil from '@misakey/helpers/isNil';
import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';
import routes from 'routes';

// HOOKS
export default (boxId, title, publicKey, t) => {
  const publicKeysWeCanDecryptFrom = useBoxPublicKeysWeCanDecryptFrom();
  const { enqueueSnackbar } = useSnackbar();
  // XXX no strong guarantee that the box in the current location
  // is the one referred to by "boxId" parameter;
  // shouldn't we get the box key share from the store instead?
  const { hash } = useLocation();


  const boxSecretKey = useMemo(
    () => publicKeysWeCanDecryptFrom.get(publicKey),
    [publicKeysWeCanDecryptFrom, publicKey],
  );

  const invitationURL = useMemo(
    () => parseUrlFromLocation(`${generatePath(routes.boxes.read._, { id: boxId })}${hash}`),
    [boxId, hash],
  );

  const boxKeyShare = useMemo(
    () => hash.substr(1),
    [hash],
  );

  const canInvite = useMemo(
    () => publicKeysWeCanDecryptFrom.has(publicKey),
    [publicKey, publicKeysWeCanDecryptFrom],
  );

  const canShare = useMemo(() => !isNil(navigator.share) && !isDesktopDevice, []);

  const onShare = useCallback(() => {
    const details = {
      title: t('boxes:read.details.menu.share.title', { title }),
      text: t('boxes:read.details.menu.share.text', { title }),
      url: invitationURL,
    };
    navigator.share(details)
      .catch((err) => {
        if (err.name !== 'AbortError') {
          enqueueSnackbar(t('common:anErrorOccurred'), { variant: 'error' });
        }
      });
  }, [enqueueSnackbar, invitationURL, t, title]);

  const onCopySuccess = useCallback(
    () => { enqueueSnackbar(t('common:copied'), { variant: 'success' }); },
    [enqueueSnackbar, t],
  );

  const onCopyLink = useCallback(
    () => {
      const success = copy(invitationURL, { message: t('common:copyInvitationLink') });
      if (success) { onCopySuccess(); }
    },
    [invitationURL, onCopySuccess, t],
  );

  return {
    canInvite,
    canShare,
    onCopyLink,
    onShare,
    invitationURL,
    boxKeyShare,
    boxSecretKey,
  };
};
