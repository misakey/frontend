import { isDesktopDevice } from '@misakey/core/helpers/devices';
import isNil from '@misakey/core/helpers/isNil';

import { useTranslation } from 'react-i18next';
import { useCallback, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import useBoxShareMetadata from 'hooks/useBoxShareMetadata';

// HOOKS
export default (boxId, title) => {
  const { t } = useTranslation(['common', 'boxes']);
  const { enqueueSnackbar } = useSnackbar();

  const { invitationURL } = useBoxShareMetadata(boxId);

  const canShareNative = useMemo(() => !isNil(navigator.share) && !isDesktopDevice, []);

  const shareDetails = useMemo(
    () => ({
      title: t('boxes:read.details.menu.share.title', { title }),
      text: t('boxes:read.details.menu.share.text', { title }),
      url: invitationURL.toString(),
    }),
    [title, invitationURL, t],
  );

  const onShare = useCallback(
    () => navigator.share(shareDetails)
      .catch((err) => {
        if (err.name !== 'AbortError') {
          enqueueSnackbar(t('common:anErrorOccurred'), { variant: 'error' });
        }
      }),
    [shareDetails, enqueueSnackbar, t],
  );

  return {
    canShareNative,
    onShare,
    shareDetails,
  };
};
