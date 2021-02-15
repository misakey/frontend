import React, { useMemo, useCallback } from 'react';
import clsx from 'clsx';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { APPBAR_HEIGHT } from '@misakey/ui/constants/sizes';
import DecryptedFileSchema from 'store/schemas/Files/Decrypted';

import isNil from '@misakey/helpers/isNil';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
// import PrintIcon from '@material-ui/icons/Print';
import FilePreviewPaper from 'components/smart/Dialog/FilePreview/Paper';
import FilePreview from 'components/smart/File/Preview';
import FilePreviewBackdrop from 'components/smart/Dialog/FilePreview/Backdrop';
import BoxFile from 'components/dumb/Box/File';

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
    flexDirection: 'column',
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
function FilePreviewDialog({
  open, onClose, selectedId, file, t,
  appBarProps, children,
  maxHeight, classes,
  getDecryptedFile,
  onDownloadFile,
  onSaveFileInVault,
  disableOnSave,
}) {
  const internalClasses = useStyles();

  const {
    isLoading, error, name, type, size, blobUrl, isSaved, encryption,
  } = useSafeDestr(file);

  const isTypeAllowedForPreview = useMemo(
    () => !isNil(type) && ALLOWED_TYPE_PREVIEW.some((elem) => type.startsWith(elem)),
    [type],
  );

  const onDownloadInBrowser = useCallback(
    () => onDownloadFile(file),
    [file, onDownloadFile],
  );

  const shouldLoadFile = useMemo(
    () => isNil(blobUrl) && open && isTypeAllowedForPreview && !isLoading && isNil(error),
    [blobUrl, error, isLoading, isTypeAllowedForPreview, open],
  );

  const onLoadFile = useCallback(
    () => getDecryptedFile(selectedId, encryption, name),
    [encryption, getDecryptedFile, name, selectedId],
  );

  const onSave = useCallback(
    () => onSaveFileInVault(file),
    [onSaveFileInVault, file],
  );

  useFetchEffect(onLoadFile, { shouldFetch: shouldLoadFile });

  const PaperProps = useMemo(
    () => ({
      className: clsx(classes.paper, internalClasses.paper),
      elevation: 0,
      onClose,
      onSave: disableOnSave ? null : onSave,
      onDownload: onDownloadInBrowser,
      fileName: name,
      disabled: !isNil(error),
      isSaved,
      appBarProps,
    }),
    [
      internalClasses.paper, classes.paper,
      disableOnSave, error, isSaved, appBarProps, name,
      onClose, onDownloadInBrowser, onSave,
    ],
  );

  const showPreview = useMemo(
    () => !isNil(blobUrl) && isTypeAllowedForPreview && isNil(error) && !isLoading,
    [blobUrl, isTypeAllowedForPreview, error, isLoading],
  );

  const BackdropProps = useMemo(
    () => ({
      size,
      name,
      type,
      isLoading,
      isBroken: !isNil(error),
      showFallback: !showPreview,
    }),
    [error, size, name, type, isLoading, showPreview],
  );

  return (
    <Dialog
      maxWidth="md"
      open={open}
      onClose={onClose}
      scroll="body"
      PaperProps={PaperProps}
      PaperComponent={FilePreviewPaper}
      BackdropProps={BackdropProps}
      BackdropComponent={FilePreviewBackdrop}
    >
      <DialogContent className={internalClasses.content}>
        {showPreview && (
          <FilePreview
            file={file}
            maxHeight={maxHeight}
            allowedFileTypePreview={ALLOWED_TYPE_PREVIEW}
            fallbackView={(
              <BoxFile
                fileSize={size}
                fileName={name || t('common:loading')}
                fileType={type}
                isBroken={!isNil(error)}
                isLarge
                typographyProps={{ variant: 'body1' }}
                textContainerProps={{ className: internalClasses.textContainerPreview }}
                maxWidth="100%"
              />
            )}
          />
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}


FilePreviewDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  selectedId: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  getDecryptedFile: PropTypes.func.isRequired,
  onDownloadFile: PropTypes.func.isRequired,
  onSaveFileInVault: PropTypes.func.isRequired,
  disableOnSave: PropTypes.bool,
  children: PropTypes.node,
  appBarProps: PropTypes.object,
  file: PropTypes.shape(DecryptedFileSchema.propTypes),
  maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  classes: PropTypes.shape({
    paper: PropTypes.string,
  }),
  // withTranslation
  t: PropTypes.func.isRequired,
};

FilePreviewDialog.defaultProps = {
  maxHeight: PREVIEW_MAX_HEIGHT,
  selectedId: null,
  children: null,
  file: null,
  disableOnSave: false,
  appBarProps: {},
  classes: {},
};

export default withTranslation(['common'])(FilePreviewDialog);
