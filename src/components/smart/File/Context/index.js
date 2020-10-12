import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';

import workerDecryptFile from '@misakey/crypto/box/decryptFile/worker';
import { getEncryptedFileBuilder } from '@misakey/helpers/builder/files';
import isNil from '@misakey/helpers/isNil';
import log from '@misakey/helpers/log';
import downloadFile from '@misakey/helpers/downloadFile';
import execWithRequestIdleCallback from '@misakey/helpers/execWithRequestIdleCallback';
import { FetchFileError, DecryptionFileError } from 'constants/Errors/classes/Files';

// CONTEXT
export const FileContext = createContext({
  file: null,
  fileSize: null,
  fileType: null,
  fileName: null,
  blobUrl: null,
  error: null,
  isLoading: null,
  getDecryptedFile: null,
  onDownloadFile: null,
});

// HOOKS
export const useFileContext = () => useContext(FileContext);

// HELPERS
const createBlobUrl = (file) => {
  try {
    const urlBuilder = window.URL || window.webkitURL;
    return urlBuilder.createObjectURL(file);
  } catch (err) {
    log('fail to create blobUrl for preview', err);
    return null;
  }
};

const revokeBlobUrl = (blobUrl) => {
  try {
    const urlBuilder = window.URL || window.webkitURL;
    return urlBuilder.revokeObjectURL(blobUrl);
  } catch (err) {
    return null;
  }
};


// COMPONENTS
const FileContextProvider = ({ decryptedContent, encryptedFileId, children }) => {
  const [isLoading, setIsLoading] = useState(null);
  const [file, setFile] = useState(null);
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(null);

  const {
    fileName,
    encryption,
    fileSize,
    fileType,
  } = useMemo(() => decryptedContent, [decryptedContent]);

  const getDecryptedFile = useCallback(
    async () => {
      if (isNil(encryptedFileId)) {
        return Promise.resolve(({ error: new FetchFileError() }));
      }
      setIsLoading(true);
      return getEncryptedFileBuilder(encryptedFileId)
        .then(async (response) => {
          try {
            const decryptedFile = await workerDecryptFile(
              response.blob,
              { encryption, fileName },
            );
            setFile(decryptedFile);
            setBlobUrl(createBlobUrl(decryptedFile));
            return decryptedFile;
          } catch (e) {
            log('fail to decrypt file for preview', e);
            setError(new DecryptionFileError());
            return null;
          }
        })
        .catch(() => setError(new FetchFileError()))
        .finally(() => setIsLoading(false));
    },
    [encryptedFileId, encryption, fileName],
  );

  const onDownloadFile = useCallback(
    () => {
      execWithRequestIdleCallback(async () => {
        const data = isNil(blobUrl) ? await getDecryptedFile() : blobUrl;
        if (isNil(data)) { return; }
        try {
          // revokeBlob is handled in this component as there is several place to download file
          downloadFile(data, fileName, /* shouldRevokeBlob */ false);
        } catch (e) {
          log(e, 'error');
        }
      });
    },
    [blobUrl, fileName, getDecryptedFile],
  );

  const onRevokeBlobUrl = useCallback(
    () => {
      if (!isNil(blobUrl)) {
        revokeBlobUrl(blobUrl);
        setBlobUrl(null);
      }
    },
    [blobUrl],
  );

  const contextValue = useMemo(
    () => ({
      file,
      fileSize,
      fileType,
      fileName,
      blobUrl,
      error,
      isLoading,
      getDecryptedFile,
      onDownloadFile,
    }),
    [blobUrl, file, error, isLoading, fileName, fileSize, fileType,
      getDecryptedFile, onDownloadFile],
  );

  useEffect(() => () => {
    // Revoke blobUrl on unmount
    onRevokeBlobUrl();
  }, [onRevokeBlobUrl]);

  return (
    <FileContext.Provider value={contextValue}>
      {children}
    </FileContext.Provider>
  );
};

FileContextProvider.propTypes = {
  children: PropTypes.node,
  decryptedContent: PropTypes.object,
  encryptedFileId: PropTypes.string.isRequired,
};

FileContextProvider.defaultProps = {
  children: null,
  decryptedContent: {},
};

export default FileContextProvider;
