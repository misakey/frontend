import React, { useCallback, useMemo, useReducer, useEffect } from 'react';

import PropTypes from 'prop-types';
import { useDispatch, batch } from 'react-redux';

import routes from 'routes';
import { FetchFileError, DecryptionFileError } from 'constants/Errors/classes/Files';
import { updateEntities } from '@misakey/store/actions/entities';

import isNil from '@misakey/core/helpers/isNil';
import { getEncryptedFileBuilder } from '@misakey/core/api/helpers/builder/files';
import workerDecryptFile from '@misakey/crypto/box/decryptFile/worker';
import log from '@misakey/core/helpers/log';
import logSentryException from '@misakey/core/helpers/log/sentry/exception';
import downloadFile from '@misakey/core/helpers/downloadFile';
import execWithRequestIdleCallback from '@misakey/core/helpers/execWithRequestIdleCallback';
import { revokeObjectURL } from '@misakey/core/helpers/objectURL';

import { useRouteMatch } from 'react-router-dom';
import useSaveFileInVault from 'hooks/useSaveFileInVault';

import { FilePreviewContext } from 'components/smart/File/Preview/Context';
import DecryptedFileSchema from 'store/schemas/Files/Decrypted';

// HELPERS
const createBlobUrl = (file) => {
  try {
    const urlBuilder = window.URL || window.webkitURL;
    return urlBuilder.createObjectURL(file);
  } catch (err) {
    logSentryException(err, 'FilePreviewContext: Fail to create blobUrl for preview', undefined, 'warning');
    return null;
  }
};

const revokeBlobUrl = (blobUrl) => {
  try {
    return revokeObjectURL(blobUrl);
  } catch (err) {
    return null;
  }
};

const filePreviewReducer = (state, { type, ...rest }) => {
  switch (type) {
    case 'SET_SELECTED': {
      return {
        ...state,
        ...rest,
      };
    }
    default:
      throw new Error();
  }
};

// COMPONENTS
const FilePreviewCarouselContextProvider = ({
  component: Component,
  children, revokeOnChange, ...props
}) => {
  const vaultSpaceRouteMatch = useRouteMatch(routes.documents._);
  const isVaultSpace = useMemo(
    () => !isNil(vaultSpaceRouteMatch),
    [vaultSpaceRouteMatch],
  );
  const [{
    filesData, selectedId,
    id: itemId,
  }, dispatchReducer] = useReducer(filePreviewReducer, {
    selectedId: null,
    id: null,
    filesData: {},
  });

  const dispatch = useDispatch();

  const onOpenFilePreview = useCallback(
    (id, paginationProps = {}) => dispatchReducer({
      type: 'SET_SELECTED',
      selectedId: id,
      ...paginationProps,
    }),
    [],
  );

  const onCloseFilePreview = useCallback(
    () => dispatchReducer({
      type: 'SET_SELECTED',
      selectedId: null,
      id: null,
    }),
    [],
  );

  const setFileData = useCallback(
    (id, data) => dispatch(updateEntities([{ id, changes: data }], DecryptedFileSchema)),
    [dispatch],
  );

  const onSaveInVault = useSaveFileInVault();

  const onSaveFileInVault = useCallback(
    (file) => {
      const { id, encryption, name: fileName, type: fileType, size: fileSize } = file;
      return onSaveInVault({ encryption, fileSize, fileName, fileType }, id);
    },
    [onSaveInVault],
  );

  const getDecryptedFile = useCallback(
    async (id, encryption, name) => {
      if (isNil(id)) {
        return setFileData(id, { error: new FetchFileError() });
      }
      setFileData(id, { isLoading: true });
      return batch(() => getEncryptedFileBuilder(id)
        .then(async (response) => {
          try {
            const decryptedFile = await workerDecryptFile(
              response.blob,
              { encryption, fileName: name },
            );
            setFileData(id, { blobUrl: createBlobUrl(decryptedFile) });
            return decryptedFile;
          } catch (e) {
            log(`fail to decrypt file for preview ${e}`);
            setFileData(id, { error: new DecryptionFileError() });
            return null;
          }
        })
        .catch((e) => setFileData(id, { error: new FetchFileError(e) }))
        .finally(() => setFileData(id, { isLoading: false })));
    },
    [setFileData],
  );

  const onDownloadFile = useCallback(
    (file) => {
      execWithRequestIdleCallback(async () => {
        const { name, id, encryption, blobUrl } = file;
        const data = isNil(blobUrl) ? await getDecryptedFile(id, encryption, name) : blobUrl;
        if (isNil(data)) { return; }
        try {
          // revokeBlob is handled in this component as there is several place to download file
          downloadFile(data, name, /* shouldRevokeBlob */ false);
        } catch (e) {
          logSentryException(e, 'FilePreviewContext: Fail to downloadFile');
        }
      });
    },
    [getDecryptedFile],
  );

  const onRevokeBlobUrl = useCallback(
    (id, blobUrl) => {
      if (!isNil(blobUrl)) {
        revokeBlobUrl(blobUrl);
        setFileData(id, { blobUrl: null });
      }
    },
    [setFileData],
  );

  const revokeAllBlobs = useCallback(
    () => batch(() => {
      Object.values(filesData).forEach(({ id, blobUrl }) => onRevokeBlobUrl(id, blobUrl));
    }),
    [onRevokeBlobUrl, filesData],
  );

  const contextValue = useMemo(
    () => ({
      onOpenFilePreview,
      onCloseFilePreview,
      getDecryptedFile,
      onDownloadFile,
      disableOnSave: isVaultSpace,
      onSaveFileInVault,
      selectedId,
    }),
    [onOpenFilePreview, onCloseFilePreview,
      getDecryptedFile, onDownloadFile, onSaveFileInVault,
      isVaultSpace, selectedId],
  );

  useEffect(
    // revoke all blobUrl on component unmount or on change param revokeOnChange
    // we could consider removing it to avoid redownload file too much
    // but it will consume browser memory
    () => () => {
      revokeAllBlobs();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [revokeOnChange],
  );

  return (
    <FilePreviewContext.Provider value={contextValue}>
      {children}
      <Component
        open={!isNil(selectedId)}
        selectedId={selectedId}
        id={itemId}
        onClose={onCloseFilePreview}
        onChange={onOpenFilePreview}
        getDecryptedFile={getDecryptedFile}
        onDownloadFile={onDownloadFile}
        onSaveFileInVault={onSaveFileInVault}
        disableOnSave={isVaultSpace}
        {...props}
      />
    </FilePreviewContext.Provider>
  );
};

FilePreviewCarouselContextProvider.propTypes = {
  component: PropTypes.elementType.isRequired,
  children: PropTypes.node,
  revokeOnChange: PropTypes.string,
};

FilePreviewCarouselContextProvider.defaultProps = {
  children: null,
  revokeOnChange: null,
};

export default FilePreviewCarouselContextProvider;
