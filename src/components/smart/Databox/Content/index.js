import React, { useMemo, useCallback, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import log from '@misakey/helpers/log';

import API from '@misakey/api';

import moment from 'moment';
import numbro from 'numbro';
import { FILE_SIZE_FORMAT } from 'constants/formats/numbers';

import ApplicationSchema from 'store/schemas/Application';
import DataboxSchema from 'store/schemas/Databox';

import { decryptToJSBlob } from '@misakey/crypto/databox/crypto';
import usePublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/usePublicKeysWeCanDecryptFrom';
import downloadFile from '@misakey/helpers/downloadFile';

import deburr from '@misakey/helpers/deburr';
import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import prop from '@misakey/helpers/prop';

import useFetchEffect from '@misakey/hooks/useFetch/effect';

import CardSimpleDoubleText from 'components/dumb/Card/Simple/DoubleText';

import List from '@material-ui/core/List';

import DatavizDialog from 'components/dumb/Dialog/Dataviz';


import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import { IS_PLUGIN } from 'constants/plugin';
import { AVAILABLE_DATAVIZ_DOMAINS } from 'components/dumb/Dataviz';

import BlobListItem from 'components/dumb/ListItem/Blob';

// HELPERS
const readBlob = async (id, onError) => {
  try {
    return (
      await API.use(API.endpoints.application.box.blob.read)
        .build({ id })
        .send()
    );
  } catch (e) {
    onError('citizen:requests.read.errors.downloadBlob.getBlob');
    return {};
  }
};

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

    const { blob: ciphertext } = await readBlob(id);

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
      moment(createdAt).format('YYYY-MM-DD-HH-mm-ss'),
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

const fetchBlobs = (id) => API
  .use(API.endpoints.application.box.blob.find)
  .build(undefined, undefined, { databox_ids: [id] })
  .send();

const idProp = prop('id');

// COMPONENTS
const DataboxContent = ({
  application,
  databox,
  initCrypto,
  t,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { mainDomain } = application;

  const databoxId = useMemo(
    () => idProp(databox),
    [databox],
  );

  const [decryptedBlob, setDecryptedBlob] = useState(null);
  const [isDatavizDialogOpen, setIsDatavizDialogOpen] = useState(false);

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
    (blob, filename, fileExtension) => {
      setDecryptedBlob({ blob, filename, fileExtension });
      setIsDatavizDialogOpen(true);
    },
    [setIsDatavizDialogOpen, setDecryptedBlob],
  );

  const shouldFetch = useMemo(
    () => !isNil(databoxId),
    [databoxId],
  );

  const getBlobs = useCallback(
    () => fetchBlobs(databoxId)
      .then((response) => response.map(objectToCamelCase)),
    [databoxId],
  );

  const { data: blobs } = useFetchEffect(
    getBlobs,
    { shouldFetch, fetchOnlyOnce: true },
  );

  const blobsCount = useMemo(
    () => (isEmpty(blobs) ? 0 : blobs.length),
    [blobs],
  );

  const allBlobsSize = useMemo(
    () => {
      const allContentLength = isEmpty(blobs)
        ? 0
        : blobs.reduce((acc, val) => (acc + val.contentLength), 0);
      return numbro(allContentLength).format(FILE_SIZE_FORMAT);
    },
    [blobs],
  );

  const isDatavizEnabled = useMemo(
    () => AVAILABLE_DATAVIZ_DOMAINS.includes(mainDomain),
    [mainDomain],
  );

  const publicKeysWeCanDecryptFrom = usePublicKeysWeCanDecryptFrom();

  const onDownload = useCallback(
    (blob) => decryptBlob(
      blob, publicKeysWeCanDecryptFrom, application, onError, onDownloadSuccess, true,
    ),
    [publicKeysWeCanDecryptFrom, application, onError, onDownloadSuccess],
  );

  const onDisplayDataviz = useCallback(
    (encryptedBlob) => decryptBlob(
      encryptedBlob, publicKeysWeCanDecryptFrom, application, onError, onDecryptForDatavizSuccess,
    ),
    [application, onError, publicKeysWeCanDecryptFrom, onDecryptForDatavizSuccess],
  );

  const vaultIsOpen = useMemo(
    () => !isEmpty(publicKeysWeCanDecryptFrom),
    [publicKeysWeCanDecryptFrom],
  );


  if (isEmpty(blobs)) {
    return null;
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
      <CardSimpleDoubleText
        my={2}
        primary={t('citizen:requests.read.content.number', { count: blobsCount })}
        secondary={allBlobsSize}
        button={(blobsCount > 0 && !vaultIsOpen) ? (
          <Button
            onClick={initCrypto}
            standing={BUTTON_STANDINGS.OUTLINED}
            size="small"
            text={t('common:decrypt')}
          />
        ) : null}
      />
      {vaultIsOpen && (
        <List disablePadding dense>
          {blobs.map((blob) => (
            <BlobListItem
              key={blob.id}
              blob={blob}
              onDownload={(isDatavizEnabled) ? onDisplayDataviz : onDownload}
              publicKeysWeCanDecryptFrom={publicKeysWeCanDecryptFrom}
              datavizEnabled={isDatavizEnabled}
            />
          ))}
        </List>
      )}
    </>
  );
};

DataboxContent.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes),
  databox: PropTypes.shape(DataboxSchema.propTypes),
  t: PropTypes.func.isRequired,
  initCrypto: PropTypes.func.isRequired,
};

DataboxContent.defaultProps = {
  application: null,
  databox: null,
};

const mapStateToProps = (state) => ({
  cryptoSecrets: state.crypto.secrets,
});
const mapDispatchToProps = null;

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation(['common', 'citizen'])(
    DataboxContent,
  ),
);
