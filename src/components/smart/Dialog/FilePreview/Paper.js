import { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import isFunction from '@misakey/helpers/isFunction';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Paper from '@material-ui/core/Paper';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import withDialogPassword from 'components/smart/Dialog/Password/with';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import ArrowBack from '@material-ui/icons/ArrowBack';
import DownloadIcon from '@material-ui/icons/GetApp';
import AddToVaultIcon from '@misakey/ui/Icon/AddToVault';

// HOOKS
const useStyles = makeStyles((theme) => ({
  appBar: {
    backgroundColor: theme.palette.grey[900],
  },
  icons: {
    // couldn't make it work with `classes: {{ disabled }}`
    '&.Mui-disabled': {
      color: theme.palette.grey[400],
    },
    [theme.breakpoints.down('sm')]: {
      paddingLeft: theme.spacing(1),
      paddingRight: theme.spacing(1),
    },
  },
}));

// COMPONENTS
const IconButtonWithDialogPassword = withDialogPassword(IconButtonAppBar);

const FilePreviewPaper = forwardRef((
  { fileName, disabled, onSave, isSaved, onDownload, onClose, t, ...props },
  ref,
) => {
  const classes = useStyles();
  const vaultLabel = useMemo(() => (isSaved ? t('common:savedInVault') : t('common:addToVault')), [isSaved, t]);

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
          <Typography>{fileName}</Typography>
          <Box flexGrow={1} />
          {isFunction(onSave) && (
            <IconButtonWithDialogPassword
              color="inherit"
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
          <>
            <IconButtonAppBar
              color="inherit"
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
          </>
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
  disabled: PropTypes.bool,
  isSaved: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

FilePreviewPaper.defaultProps = {
  fileName: 'Unknown',
  disabled: false,
  isSaved: false,
  onSave: null,
};

export default withTranslation('common')(FilePreviewPaper);
