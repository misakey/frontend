import React, { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import log from '@misakey/helpers/log';

import * as numeral from 'numeral';
import API from '@misakey/api';

import moment from 'moment';

import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';

import ApplicationSchema from 'store/schemas/Application';
import DataboxSchema from 'store/schemas/Databox';


import { ownerCryptoContext as crypto } from '@misakey/crypto';
import fileDownload from 'js-file-download';
import { NoPassword } from 'constants/Errors/classes';

import deburr from '@misakey/helpers/deburr';
import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import prop from '@misakey/helpers/prop';

import CardSimpleDoubleText from 'components/dumb/Card/Simple/DoubleText';

import List from '@material-ui/core/List';
import Button, { BUTTON_STANDINGS } from 'components/dumb/Button';

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
    onError('screens:databox.errors.getBlob');
    return {};
  }
};

const downloadBlob = async (blobMetadata, application, onAskPassword, onError) => {
  try {
    const { fileExtension, id, createdAt } = blobMetadata;
    const {
      nonce,
      ephemeral_producer_pub_key: ephemeralProducerPubKey,
    } = blobMetadata.encryption;

    if (!crypto.databox.isReadyToDecrypt()) {
      try {
        await onAskPassword();
      } catch (e) {
        if (e instanceof NoPassword) {
          // do nothing
          return;
        }
        throw e;
      }
    }
    const { blob: ciphertext } = await readBlob(id);

    if (!ciphertext || ciphertext.size === 0) {
      onError('screens:databox.errors.default');
      return;
    }

    const decryptedBlob = (
      await crypto.databox.decryptBlob(ciphertext, nonce, ephemeralProducerPubKey)
    );


    const fileName = ''.concat(
      deburr(application.name).replace(/\s/g, ''),
      '.',
      moment(createdAt).format('YYYY-MM-DD-HH-mm-ss'),
      fileExtension,
    );
    fileDownload(decryptedBlob, fileName);
  } catch (e) {
    log(e);
    onError('screens:databox.errors.default');
  }
};

const fetchBlobs = (id) => API
  .use(API.endpoints.application.box.blob.find)
  .build(undefined, undefined, { databox_ids: [id] })
  .send();

const idProp = prop('id');

// HOOKS


// COMPONENTS
const DataboxContent = ({
  application,
  databox,
  publicKeysWeCanDecryptFrom,
  isCryptoReadyToDecrypt,
  onAskPassword,
  initCrypto,
  t,
}) => {
  const [blobs, setBlobs] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenericHttpErrors = useHandleGenericHttpErrors();

  const { enqueueSnackbar } = useSnackbar();

  const databoxId = useMemo(
    () => idProp(databox),
    [databox],
  );

  const onError = useCallback(
    (translationKey) => {
      enqueueSnackbar(t(translationKey), { variant: 'error' });
    },
    [enqueueSnackbar, t],
  );

  const shouldFetch = useMemo(
    () => !isNil(databoxId) && isNil(blobs) && !loading,
    [databoxId, blobs, loading],
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

  const onDownload = useCallback(
    (blob) => downloadBlob(blob, application, onAskPassword, onError),
    [application, onAskPassword, onError],
  );

  const getBlobs = useCallback(
    () => {
      setLoading(true);
      fetchBlobs(databox.id)
        .then((response) => setBlobs(response.map(objectToCamelCase)))
        .catch(handleGenericHttpErrors)
        .finally(() => setLoading(false));
    },
    [databox, setLoading, setBlobs, handleGenericHttpErrors],
  );

  useEffect(
    () => {
      if (shouldFetch) {
        getBlobs();
      }
    },
    [getBlobs, shouldFetch],
  );

  if (isEmpty(blobs)) {
    return null;
  }

  return (
    <>
      <CardSimpleDoubleText
        my={2}
        primary={t('screens:application.vault.databoxContent.number', { count: blobsCount })}
        secondary={allBlobsSize}
        button={(blobsCount > 0 && !isCryptoReadyToDecrypt) ? (
          <Button
            onClick={initCrypto}
            standing={BUTTON_STANDINGS.OUTLINED}
            size="small"
            text={t('common:decrypt')}
          />
        ) : null}
      />
      {isCryptoReadyToDecrypt && (
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
  publicKeysWeCanDecryptFrom: PropTypes.arrayOf(PropTypes.string).isRequired,
  isCryptoReadyToDecrypt: PropTypes.bool.isRequired,
  onAskPassword: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  initCrypto: PropTypes.func.isRequired,
};

DataboxContent.defaultProps = {
  application: null,
  databox: null,
};

// CONNECT
export default withTranslation(['common', 'screens'])(DataboxContent);
