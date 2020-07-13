import { useCallback, useMemo } from 'react';
import routes from 'routes';
import { useSnackbar } from 'notistack';
import copy from '@misakey/helpers/copy';
import usePublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/usePublicKeysWeCanDecryptFrom';
import { createKeyShareBuilder } from '@misakey/helpers/builder/boxes';
import { splitBoxSecretKey } from '@misakey/crypto/box/keySplitting';
import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';
import { isDesktopDevice } from '@misakey/helpers/devices';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import isNil from '@misakey/helpers/isNil';

// HOOKS
export default (id, title, publicKey, t) => {
  const publicKeysWeCanDecryptFrom = usePublicKeysWeCanDecryptFrom();
  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();

  const canInvite = useMemo(
    () => publicKeysWeCanDecryptFrom.has(publicKey),
    [publicKey, publicKeysWeCanDecryptFrom],
  );

  const canShare = useMemo(() => !isNil(navigator.share) && !isDesktopDevice, []);

  const createInvitation = useCallback(
    () => {
      const secretKey = publicKeysWeCanDecryptFrom.get(publicKey);

      const { invitationKeyShare, misakeyKeyShare } = splitBoxSecretKey(secretKey, { boxId: id });
      return createKeyShareBuilder(misakeyKeyShare)
        .then(() => {
          const invitationURL = parseUrlFromLocation(`${routes.boxes.invitation}#${id}&${invitationKeyShare}`).href;
          return invitationURL;
        })
        .catch((error) => {
          handleHttpErrors(error);
          return null;
        })
        .catch(() => {
          enqueueSnackbar(t('common:httpStatus.error.default'), { variant: 'error' });
          return null;
        });
    },
    [enqueueSnackbar, handleHttpErrors, id, publicKey, publicKeysWeCanDecryptFrom, t],
  );

  const onShare = useCallback(async () => {
    const invitationURL = await createInvitation();
    if (!isNil(invitationURL)) {
      const details = {
        title: t('boxes:read.details.menu.share.title', { title }),
        text: t('boxes:read.details.menu.share.text', { title }),
        url: invitationURL,
      };
      navigator.share(details).catch((err) => {
        if (err.name !== 'AbortError') {
          enqueueSnackbar(t('common:httpStatus.error.default'), { variant: 'error' });
        }
      });
    }
  }, [createInvitation, enqueueSnackbar, t, title]);

  const onCopySuccess = useCallback(
    () => {
      enqueueSnackbar(t('common:copied'), { variant: 'success' });
    },
    [enqueueSnackbar, t],
  );

  const onCopyLink = useCallback(
    async () => {
      const invitationURL = await createInvitation();
      if (!isNil(invitationURL)) {
        const success = copy(invitationURL, {
          message: t('common:copyInvitationLink'),
        });
        if (success) {
          onCopySuccess();
        }
      }
    },
    [createInvitation, onCopySuccess, t],
  );

  return {
    createInvitation,
    canInvite,
    canShare,
    onCopyLink,
    onShare,
  };
};
