import React, { useMemo, useCallback } from 'react';
import { connect, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import log from '@misakey/helpers/log';

import API from '@misakey/api';

import moment from 'moment';
import { DATETIME_FILE_HUMAN_READABLE } from 'constants/formats/dates';

import { decryptToJSBlob } from '@misakey/crypto/databox/crypto';
import usePublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/usePublicKeysWeCanDecryptFrom';
import downloadFile from '@misakey/helpers/downloadFile';
import ensureSecretsLoaded from '@misakey/crypto/store/actions/ensureSecretsLoaded';

import noop from '@misakey/helpers/noop';
import isEmpty from '@misakey/helpers/isEmpty';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';

import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import BlobSchema from 'store/schemas/Boxes/Blob';
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
      'File',
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
  blob,
  t,
}) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const dispatch = useDispatch();
  const openPasswordPrompt = usePasswordPrompt();

  const {
    encryption: {
      ownerPubKey,
    },
  } = blob;

  const initCrypto = useCallback(
    () => dispatch(ensureSecretsLoaded({ openPasswordPrompt })),
    [dispatch, openPasswordPrompt],
  );

  const onError = useCallback(
    (translationKey) => {
      enqueueSnackbar(t(translationKey), { variant: 'error' });
    },
    [enqueueSnackbar, t],
  );

  const publicKeysWeCanDecryptFrom = usePublicKeysWeCanDecryptFrom();

  const onDownload = useCallback(
    () => decryptBlob(
      blob, publicKeysWeCanDecryptFrom, onError, noop, true,
    ),
    [blob, publicKeysWeCanDecryptFrom, onError],
  );

  const vaultIsOpen = useMemo(
    () => !isEmpty(publicKeysWeCanDecryptFrom),
    [publicKeysWeCanDecryptFrom],
  );

  const canBeDecrypted = publicKeysWeCanDecryptFrom.has(ownerPubKey);

  const text = useMemo(() => {
    if (!canBeDecrypted) {
      return t('common:undecryptable');
    }
    return t('common:download');
  },
  [canBeDecrypted, t]);

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
    <Button
      className={classes.buttonRoot}
      color="secondary"
      onClick={onDownload}
      disabled={!canBeDecrypted}
    >
      {text}
    </Button>
  );
};

ButtonDownloadBlob.propTypes = {
  blob: PropTypes.shape(BlobSchema.propTypes),
  t: PropTypes.func.isRequired,
};

ButtonDownloadBlob.defaultProps = {
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
