import React, { useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import clsx from 'clsx';

import { APPBAR_HEIGHT } from '@misakey/ui/constants/sizes';

import downloadFile from '@misakey/helpers/downloadFile';
import isNil from '@misakey/helpers/isNil';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useGetDecryptedFileCallback from 'hooks/useGetDecryptedFile/callback';

import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import BackdropLoading from '@misakey/ui/Backdrop/Loading';
import ArrowBack from '@material-ui/icons/ArrowBack';
import DownloadIcon from '@material-ui/icons/GetApp';
// import PrintIcon from '@material-ui/icons/Print';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import BoxFile from 'components/dumb/Box/File';

import withDialogPassword from 'components/smart/Dialog/Password/with';
import AddToVaultIcon from '@material-ui/icons/LibraryAdd';
import isFunction from '@misakey/helpers/isFunction';

const IconButtonWithDialogPassword = withDialogPassword(IconButtonAppBar);

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

const PADDING = 64;

// HOOKS
const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: APPBAR_HEIGHT,
  },
  transparentBg: {
    backgroundColor: 'transparent',
  },
  appBar: {
    backgroundColor: theme.palette.grey[900],
  },
  content: {
    display: 'flex',
    justifyContent: 'center',
    padding: 0,
  },
  icons: {
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
  media: {
    maxWidth: '100%',
    maxHeight: `calc(100vh - ${APPBAR_HEIGHT}px - ${PADDING}px)`,
  },
  embed: ({ isLoaded }) => (isLoaded ? {
    width: '100%',
    height: `calc(100vh - ${APPBAR_HEIGHT}px - ${PADDING}px)`,
  } : {
    width: 0,
    height: 0,
  }),
  textContainerPreview: {
    backgroundColor: theme.palette.background.message,
    color: theme.palette.text.secondary,
    opacity: 0.8,
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
  },
}));

// HELPERS
const createBlobUrl = (file) => {
  try {
    const urlBuilder = window.URL || window.webkitURL;
    return urlBuilder.createObjectURL(file);
  } catch (err) {
    return null;
  }
};

const revokeBlobUrl = (file) => {
  try {
    const urlBuilder = window.URL || window.webkitURL;
    return urlBuilder.revokeObjectURL(file);
  } catch (err) {
    return null;
  }
};

function FilePreviewDialog({
  t, open, onClose, encryptedFileId, encryption, fileSize, fileName, fileType, onSave,
}) {
  const [file, setFile] = useState();
  const [blobUrl, setBlobUrl] = useState();
  const [hasError, setHasError] = useState(false);

  const isMediaAudioOrVideo = useMemo(
    () => (isNil(fileType) ? false : fileType.startsWith('audio') || fileType.startsWith('video')),
    [fileType],
  );
  // Fallback for video and audio is handled inside tags
  const [isLoaded, setIsLoaded] = useState(isMediaAudioOrVideo);
  const classes = useStyles({ isLoaded });

  const onDownload = useCallback(() => downloadFile(file, file.name), [file]);

  const onSuccess = useCallback((decryptedFile) => {
    setFile(decryptedFile);
  }, []);

  const onError = useCallback(() => {
    setHasError(true);
    setIsLoaded(true);
  }, [setHasError, setIsLoaded]);

  const onLoad = useCallback(() => {
    setIsLoaded(true);
  }, [setIsLoaded]);

  const onDownloadError = useCallback(
    () => {
      setIsLoaded(true);
      return Promise.resolve(null);
    },
    [setIsLoaded],
  );

  const onGetDecryptedFile = useGetDecryptedFileCallback(
    { encryptedFileId, encryption, fileName },
    onDownloadError,
  );

  const { isFetching } = useFetchEffect(
    onGetDecryptedFile,
    { shouldFetch: open },
    { onSuccess, onError },
  );

  useEffect(() => {
    if (!isNil(file)) {
      setBlobUrl(createBlobUrl(file));
    }
    return () => {
      revokeBlobUrl(file);
    };
  }, [file]);

  const nilFileType = useMemo(
    () => isNil(fileType),
    [fileType],
  );

  const isTypeAllowedForPreview = useMemo(
    () => !nilFileType && ALLOWED_TYPE_PREVIEW.some((type) => fileType.startsWith(type)),
    [nilFileType, fileType],
  );

  const isImage = useMemo(
    () => !nilFileType && fileType.startsWith('image'),
    [nilFileType, fileType],
  );

  const isAudio = useMemo(
    () => !nilFileType && fileType.startsWith('audio'),
    [nilFileType, fileType],
  );

  const isVideo = useMemo(
    () => !nilFileType && fileType.startsWith('video'),
    [nilFileType, fileType],
  );

  const canHandleError = useMemo(
    () => isImage,
    [isImage],
  );

  const loading = useMemo(
    () => isFetching || (isTypeAllowedForPreview && canHandleError && !isLoaded),
    [isFetching, isTypeAllowedForPreview, canHandleError, isLoaded],
  );

  const displayDefault = useMemo(
    () => !isFetching
      && (isNil(blobUrl)
        || hasError
        || !isTypeAllowedForPreview
        || (!canHandleError && !isLoaded)
      ),
    [blobUrl, hasError, isFetching, isTypeAllowedForPreview, canHandleError, isLoaded],
  );

  const displayPreview = useMemo(
    () => !isFetching && isTypeAllowedForPreview && (!isNil(blobUrl) && !hasError),
    [blobUrl, hasError, isFetching, isTypeAllowedForPreview],
  );

  const preview = useMemo(() => {
    if (isNil(fileType)) {
      return null;
    }
    if (isImage) {
      return (
        <img
          src={blobUrl}
          alt={fileName}
          className={classes.media}
          onLoad={onLoad}
          onError={onError}
        />
      );
    }

    if (isAudio) {
      return (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <audio controls>
          <source src={blobUrl} type={fileType} />
          <BoxFile
            fileSize={fileSize}
            fileName={fileName}
            fileType={fileType}
            text={t('components:filePreview.errors.unavailable')}
            isLarge
            typographyProps={{ variant: 'body1' }}
          />
        </audio>
      );
    }

    if (isVideo) {
      return (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video controls className={classes.media}>
          <source src={blobUrl} type={fileType} />
          <BoxFile
            fileSize={fileSize}
            fileName={fileName}
            fileType={fileType}
            text={t('components:filePreview.errors.unavailable')}
            isLarge
            typographyProps={{ variant: 'body1' }}
          />
        </video>
      );
    }

    return (
      <embed
        title={fileName}
        className={classes.embed}
        src={blobUrl}
        type={fileType}
        onLoad={onLoad}
      />
    );
  }, [
    blobUrl,
    classes.embed, classes.media,
    fileName, fileSize, fileType, onError, onLoad,
    isImage, isAudio, isVideo,
    t,
  ]);

  const isMediaDisplayed = useMemo(
    () => (!isNil(fileType) && fileType.startsWith('image') && !hasError) || isMediaAudioOrVideo,
    [fileType, hasError, isMediaAudioOrVideo],
  );

  const dialogProps = useMemo(() => {
    if (isFetching || isMediaDisplayed) {
      return {};
    }
    return {
      fullWidth: true,
      maxWidth: 'md',
    };
  }, [isFetching, isMediaDisplayed]);

  const PaperProps = useMemo(() => {
    if (isFetching || displayDefault) {
      return {
        className: clsx(classes.paper, classes.transparentBg),
        elevation: 0,
      };
    }
    return {
      className: classes.paper,
    };
  }, [classes.paper, classes.transparentBg, displayDefault, isFetching]);

  return (
    <Dialog
      maxWidth="md"
      open={open}
      onClose={onClose}
      scroll="body"
      PaperProps={PaperProps}
      BackdropComponent={BackdropLoading}
      BackdropProps={{ loading }}
      {...dialogProps}
    >
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButtonAppBar
            color="inherit"
            aria-label={t('common:goBack')}
            edge="start"
            onClick={onClose}
          >
            <Tooltip title={t('common:goBack')}>
              <ArrowBack />
            </Tooltip>
          </IconButtonAppBar>

          <Box flexGrow={1} />
          {isFunction(onSave) && !isNil(file) && (
            <IconButtonWithDialogPassword
              color="inherit"
              className={classes.icons}
              aria-label={t('common:addToVault')}
              edge="end"
              onClick={onSave}
            >
              <Tooltip title={t('common:addToVault')}>
                <AddToVaultIcon />
              </Tooltip>
            </IconButtonWithDialogPassword>
          )}
          {!isNil(blobUrl) && (
            <>
              <IconButtonAppBar
                color="inherit"
                className={classes.icons}
                aria-label={t('common:download')}
                edge="end"
                onClick={onDownload}
              >
                <Tooltip title={t('common:download')}>
                  <DownloadIcon />
                </Tooltip>

              </IconButtonAppBar>

              {/* <IconButtonAppBar
                color="inherit"
                aria-label={t('common:print')}
                edge="end"
                onClick={() => {
                  printBlobUrl(blobUrl);
                }}
              >
                <Tooltip title={t('common:print')}>
                  <PrintIcon />
                </Tooltip>
              </IconButtonAppBar> */}
            </>
          )}
        </Toolbar>
      </AppBar>
      <DialogContent className={classes.content}>
        {displayPreview && preview}
        {displayDefault && (
          <BoxFile
            fileSize={fileSize}
            fileName={fileName}
            fileType={fileType}
            text={isNil(blobUrl)
              ? t('components:filePreview.errors.noFile')
              : t('components:filePreview.errors.unavailable')}
            isLarge
            typographyProps={{ variant: 'body1' }}
            textContainerProps={{ className: classes.textContainerPreview }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}


FilePreviewDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  fileSize: PropTypes.number,
  fileType: PropTypes.string,
  fileName: PropTypes.string,
  encryption: PropTypes.object,
  encryptedFileId: PropTypes.string.isRequired,
  onSave: PropTypes.func,
};

FilePreviewDialog.defaultProps = {
  fileSize: null,
  fileType: null,
  encryption: null,
  fileName: 'Untitled',
  onSave: null,
};

export default withTranslation(['common', 'components'])(FilePreviewDialog);
