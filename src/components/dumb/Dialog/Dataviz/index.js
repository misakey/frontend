import React, { useMemo, useCallback, useState, useRef } from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';

import downloadFile from '@misakey/helpers/downloadFile';
import isNil from '@misakey/helpers/isNil';

import withWidth, { isWidthDown } from '@material-ui/core/withWidth';
import { withTranslation } from 'react-i18next';

import getScreenshotOfElement from '@misakey/helpers/getScreenshotOfElement';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import CircularProgress from '@material-ui/core/CircularProgress';

import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import ShareOutlinedIcon from '@material-ui/icons/ShareOutlined';
import CloudDownloadOutlinedIcon from '@material-ui/icons/CloudDownloadOutlined';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import Dataviz, { AVAILABLE_DATAVIZ_DOMAINS } from 'components/dumb/Dataviz';


const useStyles = makeStyles((theme) => ({
  disableContent: {
    position: 'relative',
    overflow: 'hidden',

    '&:before': {
      display: 'block',
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: theme.zIndex.modal,
      content: '""',
    },
  },
}));

const DatavizDialog = ({
  mainDomain, open, onClose, decryptedBlob, width, t, onDownloadSuccess,
}) => {
  const classes = useStyles();

  const [isSharing, setIsSharing] = useState(false);
  const scrollContainerRef = useRef(null);

  const canDataviz = useMemo(
    () => !isNil(mainDomain) && AVAILABLE_DATAVIZ_DOMAINS.includes(mainDomain),
    [mainDomain],
  );

  const onDownload = useCallback(
    () => downloadFile(decryptedBlob.blob, decryptedBlob.filename).then(onDownloadSuccess),
    [decryptedBlob, onDownloadSuccess],
  );

  const onShare = useCallback(
    () => {
      setIsSharing(true);
      const top = scrollContainerRef.current.scrollTop;
      const left = scrollContainerRef.current.scrollLeft;
      scrollContainerRef.current.scrollTop = 0;
      scrollContainerRef.current.scrollLeft = 0;
      getScreenshotOfElement(document.getElementById('datavizcontent'))
        .then(
          (dataUri) => {
            downloadFile(dataUri, `${decryptedBlob.filename}.png`);
          },
        )
        .finally(() => {
          scrollContainerRef.current.scrollTop = top;
          scrollContainerRef.current.scrollLeft = left;
          setIsSharing(false);
        });
    },
    [decryptedBlob],
  );

  if (!canDataviz) {
    return null;
  }

  return (
    <Dialog
      onClose={onClose}
      aria-labelledby="dataviz-dialog"
      open={open}
      fullWidth
      fullScreen={isWidthDown('xs', width)}
    >
      <DialogTitle>
        <Toolbar disableGutters variant="dense">
          <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" style={{ flex: 1 }}>
            {t('citizen:dataviz.title')}
          </Typography>
          {isSharing ? (
            <CircularProgress color="secondary" />
          ) : (
            <IconButton onClick={onShare}>
              <ShareOutlinedIcon />
            </IconButton>
          )}
          <IconButton onClick={onDownload}>
            <CloudDownloadOutlinedIcon />
          </IconButton>
        </Toolbar>
      </DialogTitle>
      <DialogContent
        dividers
        ref={scrollContainerRef}
        className={(isSharing) ? classes.disableContent : null}
      >
        <Dataviz decryptedBlob={decryptedBlob} mainDomain={mainDomain} id="datavizcontent" />
      </DialogContent>
    </Dialog>
  );
};

DatavizDialog.propTypes = {
  mainDomain: PropTypes.string,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  decryptedBlob: PropTypes.object,
  width: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  onDownloadSuccess: PropTypes.func.isRequired,
};

DatavizDialog.defaultProps = {
  mainDomain: null,
  decryptedBlob: null,
};

export default withWidth()(withTranslation(['citizen'])(DatavizDialog));
