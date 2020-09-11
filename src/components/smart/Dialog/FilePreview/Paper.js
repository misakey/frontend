import React, { forwardRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import isFunction from '@misakey/helpers/isFunction';
import downloadFile from '@misakey/helpers/downloadFile';
import isNil from '@misakey/helpers/isNil';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Paper from '@material-ui/core/Paper';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import withDialogPassword from 'components/smart/Dialog/Password/with';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';

import AddToVaultIcon from '@material-ui/icons/LibraryAdd';
import ArrowBack from '@material-ui/icons/ArrowBack';
import DownloadIcon from '@material-ui/icons/GetApp';

// HOOKS
const useStyles = makeStyles((theme) => ({
  appBar: {
    backgroundColor: theme.palette.grey[900],
  },
  icons: {
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
}));

// COMPONENTS
const IconButtonWithDialogPassword = withDialogPassword(IconButtonAppBar);

const FilePreviewPaper = forwardRef(({
  onSave, onClose,
  file,
  blobUrl,
  t,
  ...props
}, ref) => {
  const classes = useStyles();

  const onDownload = useCallback(() => downloadFile(file, file.name), [file]);


  return (
    <>
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
      <Paper {...omitTranslationProps(props)} ref={ref} />
    </>
  );
});

FilePreviewPaper.propTypes = {
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  file: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }),
  blobUrl: PropTypes.string,
  // withTranslation
  t: PropTypes.func.isRequired,
};

FilePreviewPaper.defaultProps = {
  file: null,
  blobUrl: null,
};

export default withTranslation('common')(FilePreviewPaper);
