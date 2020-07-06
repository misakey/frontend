import { useCallback, useMemo } from 'react';
import routes from 'routes';
import { useSnackbar } from 'notistack';
import copy from 'copy-to-clipboard';
import usePublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/usePublicKeysWeCanDecryptFrom';
import { createKeyShareBuilder } from '@misakey/helpers/builder/boxes';
import { splitBoxSecretKey } from '@misakey/crypto/box/keySplitting';
import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';
import { isDesktopDevice } from '@misakey/helpers/devices';
import isNil from '@misakey/helpers/isNil';

// HOOKS
export default (id, title, publicKey, t) => {
  const publicKeysWeCanDecryptFrom = usePublicKeysWeCanDecryptFrom();
  const { enqueueSnackbar } = useSnackbar();

  const canInvite = useMemo(
    () => publicKeysWeCanDecryptFrom.has(publicKey),
    [publicKey, publicKeysWeCanDecryptFrom],
  );

  const canShare = useMemo(() => !isNil(navigator.share) && !isDesktopDevice, []);

  const createInvitation = useCallback(
    async () => {
      const secretKey = publicKeysWeCanDecryptFrom.get(publicKey);

      const { invitationKeyShare, misakeyKeyShare } = splitBoxSecretKey(secretKey);

      await createKeyShareBuilder(misakeyKeyShare);

      const invitationURL = parseUrlFromLocation(`${routes.boxes.invitation}#${id}&${invitationKeyShare}`).href;

      return invitationURL;
    },
    [id, publicKey, publicKeysWeCanDecryptFrom],
  );

  const onShare = useCallback(async () => {
    const invitationURL = await createInvitation();
    navigator.share({
      title: t('boxes:read.details.menu.share.title', { title }),
      text: t('boxes:read.details.menu.share.text', { title }),
      url: invitationURL,
    });
  }, [createInvitation, t, title]);

  const onCopyLink = useCallback(
    async () => {
      const invitationURL = await createInvitation();
      copy(invitationURL);
      enqueueSnackbar(t('common:copied'), { variant: 'success' });
    },
    [createInvitation, enqueueSnackbar, t],
  );

  return {
    createInvitation,
    canInvite,
    canShare,
    onCopyLink,
    onShare,
  };
};
