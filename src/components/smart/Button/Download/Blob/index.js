import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import log from '@misakey/helpers/log';

import downloadFile from '@misakey/helpers/downloadFile';

import { getBoxEncryptedFileBuilder } from '@misakey/helpers/builder/boxes';
import decryptFile from '@misakey/crypto/box/decryptFile';

import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

// HELPERS
const useStyles = makeStyles(() => ({
  buttonRoot: {
    borderRadius: 0,
  },
}));

async function downloadAndDecryptFile({ boxID, encryptedFileId, decryptedContent, onError }) {
  let encryptedFile;
  try {
    const response = await getBoxEncryptedFileBuilder(boxID, encryptedFileId);
    encryptedFile = response.blob;
  } catch (error) {
    onError('boxes:read.events.download.errors.get');
    log(error, 'error');
    return;
  }

  const file = await decryptFile(encryptedFile, decryptedContent);

  downloadFile(file, file.name);
}

// COMPONENTS
const ButtonDownloadBlob = ({ boxID, encryptedFileId, decryptedContent, t, classes }) => {
  const internalClasses = useStyles();
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
        await downloadAndDecryptFile({ boxID, encryptedFileId, decryptedContent, onError });
      } catch (e) {
        log(e);
        onError('boxes:read.events.download.errors.default');
      }
    },
    [boxID, encryptedFileId, decryptedContent, onError],
  );

  return (
    <Button
      className={internalClasses.buttonRoot}
      classes={classes}
      color="secondary"
      onClick={onDownload}
    >
      {t('common:download')}
    </Button>
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
