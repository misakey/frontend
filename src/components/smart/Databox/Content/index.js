import React, { useMemo, useCallback } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import log from '@misakey/helpers/log';

import * as numeral from 'numeral';
import API from '@misakey/api';

import moment from 'moment';

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
import usePropChanged from '@misakey/hooks/usePropChanged';

import CardSimpleDoubleText from 'components/dumb/Card/Simple/DoubleText';

import List from '@material-ui/core/List';
import Button, { BUTTON_STANDINGS } from 'components/dumb/Button';
import { IS_PLUGIN } from 'constants/plugin';

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
    onError('citizen:application.info.vault.errors.downloadBlob.getBlob');
    return {};
  }
};

const downloadBlob = async (
  blobMetadata,
  publicKeysWeCanDecryptFrom,
  application,
  onError,
  onSuccess,
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
      onError('citizen:application.info.vault.errors.downloadBlob.default');
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
    downloadFile(decryptedBlob, fileName).then(onSuccess);
  } catch (e) {
    log(e);
    onError('citizen:application.info.vault.errors.downloadBlob.default');
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

  const databoxId = useMemo(
    () => idProp(databox),
    [databox],
  );

  const databoxIdChanged = usePropChanged(databoxId);

  const onError = useCallback(
    (translationKey) => {
      enqueueSnackbar(t(translationKey), { variant: 'error' });
    },
    [enqueueSnackbar, t],
  );

  const onSuccess = useCallback(
    () => {
      if (IS_PLUGIN) {
        enqueueSnackbar(
          t('citizen:application.info.vault.downloadBlob.success'),
          { variant: 'success' },
        );
      }
    },
    [enqueueSnackbar, t],
  );

  const shouldFetch = useMemo(
    () => !isNil(databoxId) && databoxIdChanged,
    [databoxId, databoxIdChanged],
  );

  const getBlobs = useCallback(
    () => fetchBlobs(databox.id)
      .then((response) => response.map(objectToCamelCase)),
    [databox],
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
      return numeral(allContentLength).format('0b');
    },
    [blobs],
  );

  const publicKeysWeCanDecryptFrom = usePublicKeysWeCanDecryptFrom();

  const onDownload = useCallback(
    (blob) => downloadBlob(blob, publicKeysWeCanDecryptFrom, application, onError, onSuccess),
    [publicKeysWeCanDecryptFrom, application, onError, onSuccess],
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
      <CardSimpleDoubleText
        my={2}
        primary={t('citizen:application.info.vault.databoxContent.number', { count: blobsCount })}
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
              onDownload={onDownload}
              publicKeysWeCanDecryptFrom={publicKeysWeCanDecryptFrom}
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
