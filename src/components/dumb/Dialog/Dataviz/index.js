import React, { useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { denormalize } from 'normalizr';
import ApplicationSchema from 'store/schemas/Application';

import { ThemeProvider } from '@material-ui/core/styles';

import downloadFile from '@misakey/helpers/downloadFile';
import isNil from '@misakey/helpers/isNil';
import prop from '@misakey/helpers/prop';


import withWidth, { isWidthDown } from '@material-ui/core/withWidth';
import { withTranslation } from 'react-i18next';


import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import Dataviz, { AVAILABLE_DATAVIZ_DOMAINS } from 'components/dumb/Dataviz';
import useGetThemeForDataviz from 'hooks/useGetThemeForDataviz';


const DatavizDialog = ({
  mainDomain, open, onClose, decryptedBlob, width, t, onDownloadSuccess, application,
}) => {
  const scrollContainerRef = useRef(null);

  const { mainColor } = application;

  const canDataviz = useMemo(
    () => !isNil(mainDomain) && AVAILABLE_DATAVIZ_DOMAINS.includes(mainDomain),
    [mainDomain],
  );

  const onDownload = useCallback(
    () => downloadFile(decryptedBlob.blob, decryptedBlob.filename).then(onDownloadSuccess),
    [decryptedBlob, onDownloadSuccess],
  );

  const themeforType = useGetThemeForDataviz(mainColor);


  if (!canDataviz) {
    return null;
  }

  return (
    <ThemeProvider theme={themeforType}>
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
            <Button
              text={t('citizen:dataviz:sourceFile')}
              onClick={onDownload}
              standing={BUTTON_STANDINGS.TEXT}
            />
          </Toolbar>
        </DialogTitle>
        <DialogContent
          dividers
          ref={scrollContainerRef}
        >
          <Dataviz decryptedBlob={decryptedBlob} mainDomain={mainDomain} id="datavizcontent" />
        </DialogContent>
      </Dialog>
    </ThemeProvider>
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
  application: PropTypes.shape(ApplicationSchema.propTypes).isRequired,
};

DatavizDialog.defaultProps = {
  mainDomain: null,
  decryptedBlob: null,
};

const mapStateToProps = (state, ownProps) => {
  const mainDomain = prop('mainDomain')(ownProps);
  return {
    application: denormalize(
      mainDomain,
      ApplicationSchema.entity,
      state.entities,
    ),
  };
};


export default connect(mapStateToProps)(withWidth()(withTranslation(['citizen'])(DatavizDialog)));
