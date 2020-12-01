import React, { createContext, useContext, useCallback, useMemo, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useRouteMatch } from 'react-router-dom';
import routes from 'routes';

import isNil from '@misakey/helpers/isNil';
import { getEncryptedFileBuilder } from '@misakey/helpers/builder/files';
import DialogFilePreview from 'components/smart/Dialog/FilePreview';
import workerDecryptFile from '@misakey/crypto/box/decryptFile/worker';
import log from '@misakey/helpers/log';
import logSentry from '@misakey/helpers/log/sentry';
import propOr from '@misakey/helpers/propOr';
import downloadFile from '@misakey/helpers/downloadFile';
import execWithRequestIdleCallback from '@misakey/helpers/execWithRequestIdleCallback';
import { FetchFileError, DecryptionFileError } from 'constants/Errors/classes/Files';
import useSaveFileInVault from 'hooks/useSaveFileInVault';

// CONSTANTS
export const INITIAL_SUB_STATE = {
  name: null,
  type: null,
  // unused for now but may be useful later
  blobFile: null,
  blobUrl: null,
  encryption: null,
  isLoading: false,
  createdAt: null,
  sender: {},
  error: null,
};

const EMPTY = {};

// CONTEXT
export const FilePreviewContext = createContext({
  onOpenFilePreview: null,
  onCloseFilePreview: null,
  setFileData: null,
});

// HELPERS
const createBlobUrl = (file) => {
  try {
    const urlBuilder = window.URL || window.webkitURL;
    return urlBuilder.createObjectURL(file);
  } catch (err) {
    logSentry(err, 'FilePreviewContext: Fail to create blobUrl for preview', undefined, 'warning');
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

// HOOKS
export const useFilePreviewContext = () => useContext(FilePreviewContext);

const filePreviewReducer = (state, { type, ...rest }) => {
  switch (type) {
    case 'SET_SELECTED': {
      const { selectedId } = rest;
      return {
        ...state,
        selectedId,
      };
    }
    case 'SET_FILE_DATA': {
      const { fileId, data } = rest;
      return {
        ...state,
        filesData: {
          ...state.filesData,
          [fileId]: {
            ...(state.filesData[fileId] || INITIAL_SUB_STATE),
            ...data,
          },
        },
      };
    }
    default:
      throw new Error();
  }
};

// COMPONENTS
const FilePreviewContextProvider = ({ children, revokeOnChange, ...props }) => {
  const isVaultSpace = useRouteMatch(routes.documents.vault);
  const [{ filesData, selectedId }, dispatch] = useReducer(filePreviewReducer, {
    selectedId: null,
    filesData: {},
  });

  const getFileData = useCallback((id) => propOr(EMPTY, id)(filesData), [filesData]);

  const onOpenFilePreview = useCallback(
    (id) => dispatch({ type: 'SET_SELECTED', selectedId: id }),
    [],
  );

  const onCloseFilePreview = useCallback(
    () => dispatch({ type: 'SET_SELECTED', selectedId: null }),
    [],
  );

  const setFileData = useCallback(
    (fileId, data) => dispatch({ type: 'SET_FILE_DATA', fileId, data }),
    [],
  );

  const onSaveInVault = useSaveFileInVault();

  const onSaveFileInVault = useCallback(
    (id) => {
      const { encryption, name: fileName, type: fileType, size: fileSize } = getFileData(id);
      return onSaveInVault({ encryption, fileSize, fileName, fileType }, id);
    },
    [getFileData, onSaveInVault],
  );

  const getDecryptedFile = useCallback(
    async (id) => {
      if (isNil(id)) {
        return setFileData(id, { error: new FetchFileError() });
      }
      const { encryption, name } = getFileData(id);
      setFileData(id, { isLoading: true });
      return getEncryptedFileBuilder(id)
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
        .finally(() => setFileData(id, { isLoading: false }));
    },
    [getFileData, setFileData],
  );

  const onDownloadFile = useCallback(
    (id) => {
      const { blobUrl, name } = getFileData(id);
      execWithRequestIdleCallback(async () => {
        const data = isNil(blobUrl) ? await getDecryptedFile(id) : blobUrl;
        if (isNil(data)) { return; }
        try {
          // revokeBlob is handled in this component as there is several place to download file
          downloadFile(data, name, /* shouldRevokeBlob */ false);
        } catch (e) {
          logSentry(e, 'FilePreviewContext: Fail to downloadFile');
        }
      });
    },
    [getDecryptedFile, getFileData],
  );

  const onRevokeBlobUrl = useCallback(
    (id) => {
      const { blobUrl } = getFileData(id);
      if (!isNil(blobUrl)) {
        revokeBlobUrl(blobUrl);
        setFileData(id, { blobUrl: null });
      }
    },
    [getFileData, setFileData],
  );

  const revokeAllBlobs = useCallback(
    () => Object.values(filesData).forEach(({ blobUrl }) => onRevokeBlobUrl(blobUrl)),
    [onRevokeBlobUrl, filesData],
  );

  const contextValue = useMemo(
    () => ({
      onOpenFilePreview,
      onCloseFilePreview,
      setFileData,
      getFileData,
      getDecryptedFile,
      onDownloadFile,
      disableOnSave: isVaultSpace,
      onSaveFileInVault,
      selectedId,
    }),
    [onOpenFilePreview, onCloseFilePreview,
      setFileData, getFileData,
      getDecryptedFile, onDownloadFile, onSaveFileInVault,
      isVaultSpace, selectedId],
  );

  useEffect(
    // revoke all blobUrl on component unmount or on change param revokeOnChange
    () => () => {
      revokeAllBlobs();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [revokeOnChange],
  );

  return (
    <FilePreviewContext.Provider value={contextValue}>
      {children}
      <DialogFilePreview
        open={!isNil(selectedId)}
        onSave={onSaveInVault}
        onClose={onCloseFilePreview}
        {...props}
      />
    </FilePreviewContext.Provider>
  );
};

FilePreviewContextProvider.propTypes = {
  children: PropTypes.node,
  revokeOnChange: PropTypes.string,
};

FilePreviewContextProvider.defaultProps = {
  children: null,
  revokeOnChange: null,
};

export default FilePreviewContextProvider;
