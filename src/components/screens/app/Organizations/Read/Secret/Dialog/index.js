import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation, Trans } from 'react-i18next';

import { conflict } from '@misakey/core/api/constants/errorTypes';
import { FEEDBACK } from '@misakey/ui/constants/emails';

import { getCode } from '@misakey/core/helpers/apiError';
import isNil from '@misakey/core/helpers/isNil';
import {
  generateOrganizationSecretBuilder, generateOrganizationCryptoBuilder,
} from '@misakey/core/api/helpers/builder/organizations';
import downloadFile from '@misakey/core/helpers/downloadFile';
import { makeOrgCryptoInitData } from '@misakey/core/crypto/organizations';

import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';
import useFetchCallback from '@misakey/hooks/useFetch/callback';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { useSnackbar } from 'notistack';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Dialog from '@material-ui/core/Dialog';
import DialogTitleWithClose from '@misakey/ui/DialogTitle/WithCloseIcon';
import DialogContent from '@material-ui/core/DialogContent';
import BoxControlsDialog from '@misakey/ui/Box/Controls/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import TypographyPreWrappedCode from '@misakey/ui/Typography/PreWrapped/Code';
import IconButton from '@material-ui/core/IconButton';
import ButtonCopy, { MODE } from '@misakey/ui/Button/Copy';
import Box from '@material-ui/core/Box';
import Paper from '@material-ui/core/Paper';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import Link from '@material-ui/core/Link';

import DownloadIcon from '@material-ui/icons/GetApp';

// HOOKS
const useStyles = makeStyles((theme) => ({
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
  textPadded: {
    padding: theme.spacing(1),
  },
  actionsRoot: {
    flexDirection: 'column',
  },
}));

// COMPONENTS
const OrganizationsReadSecretDialog = ({ onClose, open, orgId, slug }) => {
  const { t } = useTranslation(['organizations', 'common']);
  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();
  const classes = useStyles();

  const fullScreen = useDialogFullScreen();

  const title = useMemo(
    () => t('organizations:secret.confirm.title'),
    [t],
  );

  const generateOrganizationSecret = useCallback(
    () => generateOrganizationSecretBuilder(orgId),
    [orgId],
  );

  const generateOrganizationCrypto = useCallback(
    async () => {
      const { accountRootKey, requestPayload } = await makeOrgCryptoInitData();
      await generateOrganizationCryptoBuilder(orgId, requestPayload);
      return Promise.resolve(accountRootKey);
    },
    [orgId],
  );

  const onCryptoError = useCallback(
    (e) => {
      const code = getCode(e);
      if (code === conflict) {
        return enqueueSnackbar(
          (
            <Trans i18nKey="organizations:secret.crypto.conflict">
              Crypto secret already exists. Contact
              <Link href={`mailto:${FEEDBACK}`}>{FEEDBACK}</Link>
              to generate a new one
            </Trans>
          ),
          { variant: 'warning' },
        );
      }
      return handleHttpErrors(e);
    },
    [enqueueSnackbar, handleHttpErrors],
  );

  const {
    data: cryptoSecret,
    wrappedFetch: fetchCrypto,
    isFetching: isFetchingCrypto } = useFetchCallback(
    generateOrganizationCrypto,
    { onError: onCryptoError },
  );

  const {
    data: secretData,
    wrappedFetch: fetchSecret,
    isFetching: isFetchingSecret } = useFetchCallback(
    generateOrganizationSecret,
    { onError: handleHttpErrors },
  );

  const isFetching = useMemo(
    () => isFetchingCrypto || isFetchingSecret,
    [isFetchingCrypto, isFetchingSecret],
  );

  const wrappedFetch = useCallback(
    async () => {
      await fetchCrypto();
      await fetchSecret();
    },
    [fetchCrypto, fetchSecret],
  );

  const { secret } = useSafeDestr(secretData);

  const noData = useMemo(
    () => isNil(secret) && isNil(cryptoSecret),
    [cryptoSecret, secret],
  );

  const primary = useMemo(
    () => (noData
      ? {
        autoFocus: true,
        onClick: wrappedFetch,
        isLoading: isFetching,
        text: t('organizations:secret.generate'),
      }
      : {
        autoFocus: true,
        onClick: onClose,
        text: t('common:close'),
      }),
    [isFetching, noData, onClose, t, wrappedFetch],
  );

  const secrets = useMemo(
    () => `MISAKEY_CLIENT_ID=${orgId}\nMISAKEY_CLIENT_SECRET=${secret || ''}\nMISAKEY_CRYPTO_SECRET=${cryptoSecret || ''}`,
    [secret, cryptoSecret, orgId],
  );

  const fileName = useMemo(() => `Misakey_${slug}_Secrets.txt`, [slug]);

  const onDownloadSecrets = useCallback(
    () => {
      const toDl = new Blob([secrets], { type: 'text/plain' });
      downloadFile(toDl, fileName);
    },
    [fileName, secrets],
  );

  return (
    <Dialog
      fullWidth
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
    >
      <DialogTitleWithClose title={title} onClose={onClose} />
      <DialogContent>
        <Typography>
          {t('organizations:secret.copy')}
        </Typography>
        {!noData && (
          <Paper component={Box} my={1} width="100%" variant="outlined">
            <Box className={classes.menuBar}>
              <Typography className={classes.fileTitle} variant="caption">
                {fileName}
              </Typography>
              <BoxFlexFill />
              <ButtonCopy
                size="small"
                iconProps={{ fontSize: 'small' }}
                value={secrets}
                mode={MODE.icon}
              />
              <IconButton size="small" onClick={onDownloadSecrets}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Box>

            <TypographyPreWrappedCode className={classes.textPadded}>
              {secrets}
            </TypographyPreWrappedCode>
          </Paper>
        )}
      </DialogContent>
      <DialogActions>
        <BoxControlsDialog
          primary={primary}
          irreversible={noData}
        />
      </DialogActions>
    </Dialog>
  );
};

OrganizationsReadSecretDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  orgId: PropTypes.string.isRequired,
  slug: PropTypes.string,
};

OrganizationsReadSecretDialog.defaultProps = {
  slug: null,
};

export default OrganizationsReadSecretDialog;
