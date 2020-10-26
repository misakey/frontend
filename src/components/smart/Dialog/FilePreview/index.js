import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import isNil from '@misakey/helpers/isNil';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
// import PrintIcon from '@material-ui/icons/Print';
import FilePreviewPaper from 'components/smart/Dialog/FilePreview/Paper';
import FilePreview from 'components/smart/File/Preview';
import Backdrop from '@material-ui/core/Backdrop';
import BoxFile from 'components/dumb/Box/File';
import { APPBAR_HEIGHT } from '@misakey/ui/constants/sizes';
import { useFilePreviewContext } from 'components/smart/File/Preview/Context';
import useFetchEffect from '@misakey/hooks/useFetch/effect';

// CONSTANTS
const ALLOWED_TYPE_PREVIEW = [
  'audio/',
  'video/',
  'image/',
  'text/csv',
  'text/plain',
  'application/json',
  // 'application/pdf',
];

// All height without appbar height + dialog content padding
const PREVIEW_MAX_HEIGHT = `calc(100vh - ${APPBAR_HEIGHT}px - 16px)`;

// HOOKS
const useStyles = makeStyles((theme) => ({
  paper: {
    margin: `${APPBAR_HEIGHT}px 0 0 0`,
    backgroundColor: 'transparent',
    maxWidth: '100%',
  },
  content: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '&:first-child': {
      padding: theme.spacing(1),
    },
  },
  textContainerPreview: {
    backgroundColor: theme.palette.background.message,
    color: theme.palette.text.secondary,
    opacity: 0.8,
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
  },
}));

// COMPONENTS
function FilePreviewDialog({ open, onClose }) {
  const classes = useStyles();

  const {
    getFileData,
    getDecryptedFile,
    onDownloadFile,
    onSaveFileInVault,
    disableOnSave,
    selectedId,
  } = useFilePreviewContext();

  const selected = getFileData(selectedId);

  const {
    isLoading, error, name, type, size, blobUrl,
  } = useMemo(() => selected, [selected]);

  const isTypeAllowedForPreview = useMemo(
    () => !isNil(type) && ALLOWED_TYPE_PREVIEW.some((elem) => type.startsWith(elem)),
    [type],
  );

  const onDownloadInBrowser = useCallback(
    () => onDownloadFile(selectedId),
    [onDownloadFile, selectedId],
  );

  const shouldLoadFile = useMemo(
    () => isNil(blobUrl) && open && isTypeAllowedForPreview && !isLoading && isNil(error),
    [blobUrl, error, isLoading, isTypeAllowedForPreview, open],
  );

  const onLoadFile = useCallback(
    () => getDecryptedFile(selectedId),
    [getDecryptedFile, selectedId],
  );

  const onSave = useCallback(
    () => onSaveFileInVault(selectedId),
    [onSaveFileInVault, selectedId],
  );

  useFetchEffect(onLoadFile, { shouldFetch: shouldLoadFile });

  const PaperProps = useMemo(
    () => ({
      className: classes.paper,
      elevation: 0,
      onClose,
      onSave: !disableOnSave && onSave,
      onDownload: onDownloadInBrowser,
      fileName: name,
      disabled: !isNil(error),
    }),
    [classes.paper, disableOnSave, error, name, onClose, onDownloadInBrowser, onSave],
  );

  return (
    <Dialog
      maxWidth="md"
      open={open}
      onClose={onClose}
      scroll="body"
      PaperProps={PaperProps}
      PaperComponent={FilePreviewPaper}
      BackdropComponent={(props) => (
        <Backdrop {...props}>
          {(isNil(blobUrl) || !isTypeAllowedForPreview || !isNil(error)) && (
            <BoxFile
              fileSize={size}
              fileName={name}
              fileType={type}
              isLoading={isLoading}
              isBroken={!isNil(error)}
              isLarge
              typographyProps={{ variant: 'body1' }}
              textContainerProps={{ className: classes.textContainerPreview }}
            />
          )}
        </Backdrop>
      )}
    >
      <DialogContent className={classes.content}>
        <FilePreview
          file={selected}
          maxHeight={PREVIEW_MAX_HEIGHT}
          allowedFileTypePreview={ALLOWED_TYPE_PREVIEW}
        />
      </DialogContent>
    </Dialog>
  );
}


FilePreviewDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};


export default withTranslation(['common', 'components'])(FilePreviewDialog);
