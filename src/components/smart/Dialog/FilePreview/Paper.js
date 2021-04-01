import React, { forwardRef, useMemo } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import isFunction from '@misakey/core/helpers/isFunction';
import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Paper from '@material-ui/core/Paper';
import IconButtonAppBar from '@misakey/ui/IconButton/AppBar';
import withDialogPassword from '@misakey/react-auth/components/Dialog/Password/with';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import CloseIcon from '@material-ui/icons/Close';
import DownloadIcon from '@material-ui/icons/GetApp';
import AddToVaultIcon from '@misakey/ui/Icon/AddToVault';

// HOOKS
const useStyles = makeStyles((theme) => ({
  appBar: {
    backgroundColor: theme.palette.background.darker,
    color: theme.palette.getContrastText(theme.palette.background.darker),
  },
  toolbar: {
    justifyContent: 'center',
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

const FilePreviewPaper = forwardRef((
  { fileName, title, disabled, onSave, isSaved, onDownload, onClose, t, appBarProps, ...props },
  ref,
) => {
  const classes = useStyles();
  const vaultLabel = useMemo(() => (isSaved ? t('common:savedInVault') : t('common:addToVault')), [isSaved, t]);

  return (
    <>
      <AppBar className={classes.appBar} {...appBarProps}>
        <Toolbar className={classes.toolbar}>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            overflow="hidden"
          >
            <IconButtonAppBar
              color="darker"
              aria-label={t('common:close')}
              edge="start"
              onClick={onClose}
            >
              <Tooltip title={t('common:close')}>
                <CloseIcon />
              </Tooltip>
            </IconButtonAppBar>
            <Typography noWrap>{fileName}</Typography>
          </Box>
          <BoxFlexFill />
          {title}
          <BoxFlexFill />
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
          >
            {isFunction(onSave) && (
              <IconButtonWithDialogPassword
                color="darker"
                className={classes.icons}
                aria-label={vaultLabel}
                edge="end"
                disabled={disabled || isSaved}
                onClick={onSave}
              >
                <Tooltip title={vaultLabel}>
                  <AddToVaultIcon isSaved={isSaved} />
                </Tooltip>
              </IconButtonWithDialogPassword>
            )}
            <IconButtonAppBar
              color="darker"
              className={classes.icons}
              aria-label={t('common:download')}
              edge="end"
              disabled={disabled}
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
          </Box>
        </Toolbar>
      </AppBar>
      <Paper {...omitTranslationProps(props)} ref={ref} />
    </>
  );
});

FilePreviewPaper.propTypes = {
  onDownload: PropTypes.func.isRequired,
  onSave: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  fileName: PropTypes.string,
  title: PropTypes.node,
  disabled: PropTypes.bool,
  isSaved: PropTypes.bool,
  appBarProps: PropTypes.object,
  // withTranslation
  t: PropTypes.func.isRequired,
};

FilePreviewPaper.defaultProps = {
  fileName: 'Unknown',
  title: null,
  disabled: false,
  isSaved: false,
  onSave: null,
  appBarProps: {},
};

export default withTranslation('common')(FilePreviewPaper);
