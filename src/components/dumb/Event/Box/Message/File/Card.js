import React, { useMemo, useCallback, useState } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import isNil from '@misakey/helpers/isNil';
import DialogFilePreview from 'components/smart/Dialog/FilePreview';
import EventCard from 'components/dumb/Event/Card';
import BoxFile from 'components/dumb/Box/File';
import isEmpty from '@misakey/helpers/isEmpty';

import makeStyles from '@material-ui/core/styles/makeStyles';
import ButtonBase from '@material-ui/core/ButtonBase';
import useSaveFileInVault from 'hooks/useSaveFileInVault';

const useStyles = makeStyles((theme) => ({
  filePreview: {
    border: `1px solid ${theme.palette.divider}`,
    borderTopLeftRadius: 'inherit',
    borderTopRightRadius: 'inherit',
    backgroundColor: theme.palette.background.default,
    minWidth: 150,
    width: '100%',
  },
}));

// COMPONENTS
const FileCardEvent = ({
  sender,
  isFromCurrentUser,
  text,
  decryptedContent,
  encryptedFileId,
}) => {
  const classes = useStyles();
  const [isFilePreviewOpened, setIsFilePreviewOpened] = useState(false);

  const {
    fileSize,
    fileType,
    fileName,
    encryption,
  } = useMemo(() => decryptedContent, [decryptedContent]);

  const onSaveInVault = useSaveFileInVault(
    { encryption, fileSize, fileName, fileType }, encryptedFileId,
  );

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
        encryption={encryption}
        encryptedFileId={encryptedFileId}
        onClose={onCloseFilePreview}
        onSave={onSaveInVault}
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

export default FileCardEvent;
