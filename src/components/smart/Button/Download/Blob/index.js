import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import log from '@misakey/helpers/log';
import downloadFile from '@misakey/helpers/downloadFile';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import { getBoxEncryptedFileBuilder } from '@misakey/helpers/builder/boxes';
import decryptFile from '@misakey/crypto/box/decryptFile';

import { useSnackbar } from 'notistack';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

async function downloadAndDecryptFile({ boxID, encryptedFileId, decryptedContent, onError }) {
  let encryptedFile;
  try {
    const response = await getBoxEncryptedFileBuilder(boxID, encryptedFileId);
    encryptedFile = response.blob;
  } catch (error) {
    log(error, 'error');
    return onError('boxes:read.events.download.errors.get');
  }

  const file = await decryptFile(encryptedFile, decryptedContent);

  return downloadFile(file, file.name);
}

// COMPONENTS
const ButtonDownloadBlob = ({ boxID, encryptedFileId, decryptedContent, t, ...rest }) => {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const onError = useCallback(
    (translationKey) => {
      enqueueSnackbar(t(translationKey), { variant: 'error' });
    },
    [enqueueSnackbar, t],
  );

  const onDownload = useCallback(
    async () => {
      try {
        setLoading(true);
        await downloadAndDecryptFile({ boxID, encryptedFileId, decryptedContent, onError });
      } catch (e) {
        log(e);
        onError('boxes:read.events.download.errors.default');
      }
      setLoading(false);
    },
    [boxID, encryptedFileId, decryptedContent, onError],
  );

  return (
    <Button
      color="secondary"
      isLoading={loading}
      onClick={onDownload}
      standing={BUTTON_STANDINGS.TEXT}
      text={t('common:download')}
      {...omitTranslationProps(rest)}
    />
  );
};

ButtonDownloadBlob.propTypes = {
  t: PropTypes.func.isRequired,
  boxID: PropTypes.string.isRequired,
  encryptedFileId: PropTypes.string.isRequired,
  decryptedContent: PropTypes.object.isRequired,
  classes: PropTypes.object,
};

ButtonDownloadBlob.defaultProps = {
  classes: {},
};

export default withTranslation(['common', 'boxes'])(
  ButtonDownloadBlob,
);
