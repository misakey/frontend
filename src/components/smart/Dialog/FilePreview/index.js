import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import isNil from '@misakey/helpers/isNil';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
// import PrintIcon from '@material-ui/icons/Print';
import FilePreviewPaper from 'components/smart/Dialog/FilePreview/Paper';
import FilePreview from 'components/smart/File/Preview';
import { useFileContext } from 'components/smart/File/Context';
import Backdrop from '@material-ui/core/Backdrop';
import BoxFile from 'components/dumb/Box/File';
import { APPBAR_HEIGHT } from '@misakey/ui/constants/sizes';


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
function FilePreviewDialog({ open, onClose, onSave }) {
  const classes = useStyles();

  const {
    getDecryptedFile,
    blobUrl,
    file,
    fileType,
    fileSize,
    fileName,
    isLoading,
    error,
  } = useFileContext();

  const isTypeAllowedForPreview = useMemo(
    () => !isNil(fileType) && ALLOWED_TYPE_PREVIEW.some((type) => fileType.startsWith(type)),
    [fileType],
  );

  const shouldDownloadFile = useMemo(
    () => isNil(file) && open && isTypeAllowedForPreview,
    [file, isTypeAllowedForPreview, open],
  );

  useEffect(() => {
    if (shouldDownloadFile) {
      getDecryptedFile();
    }
  }, [getDecryptedFile, shouldDownloadFile]);

  const PaperProps = useMemo(
    () => {
      const dataProps = { onClose, onSave };
      return {
        className: classes.paper,
        elevation: 0,
        ...dataProps,
      };
    },
    [classes.paper, onClose, onSave],
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
          {(isNil(blobUrl) || !isNil(error)) && (
            <BoxFile
              fileSize={fileSize}
              fileName={fileName}
              fileType={fileType}
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
        <FilePreview maxHeight={PREVIEW_MAX_HEIGHT} allowedFileTypePreview={ALLOWED_TYPE_PREVIEW} />
      </DialogContent>
    </Dialog>
  );
}


FilePreviewDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};

FilePreviewDialog.defaultProps = {
  onSave: null,
};

export default withTranslation(['common', 'components'])(FilePreviewDialog);
