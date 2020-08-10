import React, { useMemo, useCallback, useState } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';

import { getBoxEncryptedFileBuilder } from '@misakey/helpers/builder/boxes';
import decryptFile from '@misakey/crypto/box/decryptFile';

import isNil from '@misakey/helpers/isNil';
import DialogFilePreview from 'components/smart/Dialog/FilePreview';
import EventCard from 'components/dumb/Event/Card';
import BoxFile from 'components/dumb/Box/File';
import isEmpty from '@misakey/helpers/isEmpty';

import makeStyles from '@material-ui/core/styles/makeStyles';
import ButtonBase from '@material-ui/core/ButtonBase';

const useStyles = makeStyles((theme) => ({
  filePreview: {
    border: `1px solid ${theme.palette.grey[300]}`,
    borderTopLeftRadius: 'inherit',
    borderTopRightRadius: 'inherit',
    backgroundColor: theme.palette.common.white,
    minWidth: 150,
    width: '100%',
  },
  icons: {
    color: theme.palette.grey[300],
    fontSize: 30,
  },
}));

// COMPONENTS
const FileCardEvent = ({
  sender,
  isFromCurrentUser,
  text,
  boxId,
  decryptedContent,
  encryptedFileId,
  t,
}) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [isFilePreviewOpened, setIsFilePreviewOpened] = useState(false);

  const { fileSize, fileType, fileName } = useMemo(() => decryptedContent, [decryptedContent]);

  const openFilePreview = useCallback(
    () => {
      setIsFilePreviewOpened(true);
    },
    [],
  );

  const onCloseFilePreview = useCallback(
    () => {
      setIsFilePreviewOpened(false);
    },
    [],
  );

  const onError = useCallback(() => {
    enqueueSnackbar(t('boxes:read.events.download.errors.get'), { variant: 'error' });
    return Promise.resolve(null);
  }, [enqueueSnackbar, t]);

  const onGetDecryptedFile = useCallback(
    () => {
      if (!isNil(boxId) && !isNil(encryptedFileId)) {
        return getBoxEncryptedFileBuilder(boxId, encryptedFileId)
          .then((response) => decryptFile(response.blob, decryptedContent))
          .catch(onError);
      }
      return Promise.reject();
    }, [boxId, decryptedContent, encryptedFileId, onError],
  );

  const onClick = useMemo(
    () => {
      if (isEmpty(decryptedContent)) {
        return null;
      }
      return openFilePreview;
    },
    [decryptedContent, openFilePreview],
  );

  return (
    <EventCard
      author={sender}
      isFromCurrentUser={isFromCurrentUser}
      text={text}
    >
      <DialogFilePreview
        open={isFilePreviewOpened}
        fileSize={fileSize}
        fileName={fileName}
        fileType={fileType}
        onGetDecryptedFile={onGetDecryptedFile}
        onClose={onCloseFilePreview}
      />
      <ButtonBase className={clsx(classes.filePreview)} onClick={onClick} disabled={isNil(onClick)}>
        <BoxFile
          fileName={fileName}
          fileType={fileType}
          fileSize={fileSize}
        />
      </ButtonBase>
    </EventCard>
  );
};

FileCardEvent.propTypes = {
  isFromCurrentUser: PropTypes.bool,
  text: PropTypes.string.isRequired,
  decryptedContent: PropTypes.object,
  boxId: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  encryptedFileId: PropTypes.string.isRequired,
  sender: PropTypes.shape({
    displayName: PropTypes.string,
    avatarUrl: PropTypes.string,
  }).isRequired,
};

FileCardEvent.defaultProps = {
  isFromCurrentUser: false,
  decryptedContent: {},
};

export default withTranslation('boxes')(FileCardEvent);
