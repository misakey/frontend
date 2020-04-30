import React, { useMemo, useCallback, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import log from '@misakey/helpers/log';

import API from '@misakey/api';

import moment from 'moment';
import { DATETIME_FILE_HUMAN_READABLE } from 'constants/formats/dates';

import ApplicationSchema from 'store/schemas/Application';

import { decryptToJSBlob } from '@misakey/crypto/databox/crypto';
import usePublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/usePublicKeysWeCanDecryptFrom';
import downloadFile from '@misakey/helpers/downloadFile';
import ensureSecretsLoaded from '@misakey/crypto/store/actions/ensureSecretsLoaded';

import deburr from '@misakey/helpers/deburr';
import isEmpty from '@misakey/helpers/isEmpty';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import DatavizDialog from 'components/dumb/Dialog/Dataviz';

import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import { IS_PLUGIN } from 'constants/plugin';
import { AVAILABLE_DATAVIZ_DOMAINS } from 'components/dumb/Dataviz';
import BlobSchema from 'store/schemas/Databox/Blob';
import { usePasswordPrompt } from 'components/dumb/PasswordPrompt';


// HELPERS
const readBlob = async (id, onError) => {
  try {
    return (
      await API.use(API.endpoints.request.blob.read)
        .build({ id })
        .send()
    );
  } catch (e) {
    onError('citizen:requests.read.errors.downloadBlob.getBlob');
    return {};
  }
};


// HELPERS
const useStyles = makeStyles(() => ({
  buttonRoot: {
    borderRadius: 0,
  },
}));

const decryptBlob = async (
  blobMetadata,
  publicKeysWeCanDecryptFrom,
  application,
  onError,
  onSuccess,
  shouldDownload = false,
) => {
  try {
    const { fileExtension, id, createdAt } = blobMetadata;
    const {
      nonce,
      ephemeralProducerPubKey,
      ownerPubKey,
    } = objectToCamelCase(blobMetadata.encryption);

    const { blob: ciphertext } = await readBlob(id, onError);

    if (!ciphertext || ciphertext.size === 0) {
      onError('citizen:requests.read.errors.downloadBlob.default');
      return;
    }

    const ownerSecretKey = publicKeysWeCanDecryptFrom.get(ownerPubKey);

    const decryptedBlob = (
      await decryptToJSBlob(
        ciphertext,
        nonce,
        ephemeralProducerPubKey,
        ownerSecretKey,
      )
    );

    const fileName = ''.concat(
      deburr(application.name).replace(/\s/g, ''),
      '.',
      moment(createdAt).format(DATETIME_FILE_HUMAN_READABLE),
      fileExtension,
    );
    if (shouldDownload) {
      downloadFile(decryptedBlob, fileName).then(onSuccess);
    } else {
      onSuccess(decryptedBlob, fileName, fileExtension);
    }
  } catch (e) {
    log(e);
    onError('citizen:requests.read.errors.downloadBlob.default');
  }
};


// COMPONENTS
const ButtonDownloadBlob = ({
  application,
  blob,
  t,
}) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { mainDomain } = application;

  const dispatch = useDispatch();
  const openPasswordPrompt = usePasswordPrompt();

  const {
    encryption: {
      ownerPubKey,
    },
  } = blob;

  const [decryptedBlob, setDecryptedBlob] = useState(null);
  const [isDatavizDialogOpen, setIsDatavizDialogOpen] = useState(false);

  const initCrypto = useCallback(
    () => dispatch(ensureSecretsLoaded({ openPasswordPrompt })),
    [dispatch, openPasswordPrompt],
  );

  const onCloseDatavizDialog = useCallback(
    () => setIsDatavizDialogOpen(false),
    [setIsDatavizDialogOpen],
  );

  const onError = useCallback(
    (translationKey) => {
      enqueueSnackbar(t(translationKey), { variant: 'error' });
    },
    [enqueueSnackbar, t],
  );

  const onDownloadSuccess = useCallback(
    () => {
      if (IS_PLUGIN) {
        enqueueSnackbar(
          t('citizen:requests.read.downloadBlob.success'),
          { variant: 'success' },
        );
      }
    },
    [enqueueSnackbar, t],
  );

  const onDecryptForDatavizSuccess = useCallback(
    (file, filename, fileExtension) => {
      setDecryptedBlob({ blob: file, filename, fileExtension });
      setIsDatavizDialogOpen(true);
    },
    [],
  );

  const isDatavizEnabled = useMemo(
    () => AVAILABLE_DATAVIZ_DOMAINS.includes(mainDomain),
    [mainDomain],
  );

  const publicKeysWeCanDecryptFrom = usePublicKeysWeCanDecryptFrom();

  const onDownload = useCallback(
    () => decryptBlob(
      blob, publicKeysWeCanDecryptFrom, application, onError, onDownloadSuccess, true,
    ),
    [blob, publicKeysWeCanDecryptFrom, application, onError, onDownloadSuccess],
  );

  const onDisplayDataviz = useCallback(
    () => decryptBlob(
      blob, publicKeysWeCanDecryptFrom, application, onError, onDecryptForDatavizSuccess,
    ),
    [blob, publicKeysWeCanDecryptFrom, application, onError, onDecryptForDatavizSuccess],
  );

  const vaultIsOpen = useMemo(
    () => !isEmpty(publicKeysWeCanDecryptFrom),
    [publicKeysWeCanDecryptFrom],
  );

  const canBeDecrypted = publicKeysWeCanDecryptFrom.has(ownerPubKey);

  const onClick = useCallback(
    () => (isDatavizEnabled ? onDisplayDataviz() : onDownload()),
    [isDatavizEnabled, onDisplayDataviz, onDownload],
  );

  const text = useMemo(() => {
    if (!canBeDecrypted) {
      return t('common:undecryptable');
    }
    if (isDatavizEnabled) {
      return t('common:view');
    }
    return t('common:download');
  },
  [canBeDecrypted, isDatavizEnabled, t]);

  if (!vaultIsOpen) {
    return (
      <Button
        className={classes.buttonRoot}
        onClick={initCrypto}
        color="secondary"
      >
        {t('common:decrypt')}
      </Button>
    );
  }

  return (
    <>
      <DatavizDialog
        mainDomain={mainDomain}
        open={isDatavizDialogOpen}
        onClose={onCloseDatavizDialog}
        decryptedBlob={decryptedBlob}
        onDownloadSuccess={onDownloadSuccess}
      />
      <Button
        className={classes.buttonRoot}
        color="secondary"
        onClick={onClick}
        disabled={!canBeDecrypted}
      >
        {text}
      </Button>
    </>
  );
};

ButtonDownloadBlob.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes),
  blob: PropTypes.shape(BlobSchema.propTypes),
  t: PropTypes.func.isRequired,
};

ButtonDownloadBlob.defaultProps = {
  application: null,
  blob: null,
};

const mapStateToProps = (state) => ({
  cryptoSecrets: state.crypto.secrets,
});
const mapDispatchToProps = null;

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation(['common', 'citizen'])(
    ButtonDownloadBlob,
  ),
);
