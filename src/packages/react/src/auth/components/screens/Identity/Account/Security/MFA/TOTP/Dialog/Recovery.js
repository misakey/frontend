import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import dialogIsFullScreen from '@misakey/core/helpers/dialog/isFullScreen';
import downloadFile from '@misakey/core/helpers/downloadFile';

import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import makeStyles from '@material-ui/core/styles/makeStyles';

import BoxControlsDialog from '@misakey/ui/Box/Controls/Dialog';
import DialogContent from '@misakey/ui/DialogContent';
import DialogTitleWithClose from '@misakey/ui/DialogTitle/WithCloseIcon';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import ButtonCopy, { MODE } from '@misakey/ui/Button/Copy';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import DownloadIcon from '@material-ui/icons/GetApp';


// CONSTANTS
const { identifierValue: IDENTIFIER_VALUE_SELECTOR } = authSelectors;

// HOOKS
const useStyles = makeStyles((theme) => ({
  dialogContentRoot: {
    padding: theme.spacing(0, 0, 1, 0),
    [dialogIsFullScreen(theme)]: {
      paddingBottom: theme.spacing(0),
    },
  },
  prewrap: {
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
  },
  menuBar: {
    padding: theme.spacing(1),
    backgroundColor: theme.palette.grey[300],
    display: 'flex',
    alignItems: 'center',
    borderTopLeftRadius: 'inherit',
    borderTopRightRadius: 'inherit',
  },
  fileTitle: {
    fontWeight: 800,
    padding: theme.spacing(0, 1),
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },
  recoveryCodesText: {
    padding: theme.spacing(1),
    fontFamily: 'monospace',
  },
}));

function RecoveryTotpDialogContent({ onClose, recoveryCodes }) {
  const classes = useStyles();

  const { t } = useTranslation(['account', 'common']);

  const identifierValue = useSelector(IDENTIFIER_VALUE_SELECTOR);

  const recoveryCodesText = useMemo(() => recoveryCodes.join('\n'), [recoveryCodes]);
  const fileName = useMemo(() => `Misakey_TOTP_Recovery_${identifierValue}.txt`, [identifierValue]);

  const onDownloadRecoveryCode = useCallback(
    () => {
      const data = new Blob([recoveryCodesText], { type: 'text/plain' });
      downloadFile(data, fileName);
    },
    [fileName, recoveryCodesText],
  );

  return (
    <>
      <DialogTitleWithClose
        title={t('account:security.MFA.totp.dialog.title.recovery')}
        onClose={onClose}
      />
      <DialogContent
        classes={{ root: classes.dialogContentRoot }}
        subtitle={<Subtitle className={classes.prewrap}>{t('account:security.MFA.totp.dialog.subtitle.recovery')}</Subtitle>}
      >
        <Paper component={Box} my={1} width="100%" variant="outlined">
          <Box className={classes.menuBar}>
            <Typography className={classes.fileTitle} variant="caption">
              {fileName}
            </Typography>
            <BoxFlexFill />
            <ButtonCopy
              size="small"
              iconProps={{ fontSize: 'small' }}
              value={recoveryCodesText}
              mode={MODE.icon}
            />
            <IconButton size="small" onClick={onDownloadRecoveryCode}>
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography className={clsx(classes.recoveryCodesText, classes.prewrap)}>
            {recoveryCodesText}
          </Typography>
        </Paper>
        <BoxControlsDialog
          mt={1}
          primary={{ text: t('common:close') }}
          onClick={onClose}
        />
      </DialogContent>
    </>
  );
}

RecoveryTotpDialogContent.propTypes = {
  onClose: PropTypes.func.isRequired,
  recoveryCodes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default RecoveryTotpDialogContent;
