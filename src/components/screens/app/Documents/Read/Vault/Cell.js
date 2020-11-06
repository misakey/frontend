import React, { useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch, connect } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { denormalize } from 'normalizr';

import useFetchCallback from '@misakey/hooks/useFetch/callback';

import { decryptFileMetadataFromVault } from '@misakey/crypto/vault';
import { selectors as cryptoSelectors } from '@misakey/crypto/store/reducers';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import isEmpty from '@misakey/helpers/isEmpty';
import log from '@misakey/helpers/log';
import isNil from '@misakey/helpers/isNil';
import omit from '@misakey/helpers/omit';
import execWithRequestIdleCallback from '@misakey/helpers/execWithRequestIdleCallback';
import useFetchEffect from '@misakey/hooks/useFetch/effect';

import SavedFilesSchema from 'store/schemas/Files/Saved';
import { deleteSavedFileBuilder } from 'packages/helpers/src/builder/vault';
import { deleteSavedFile } from 'store/reducers/savedFiles';
import { useFilePreviewContext } from 'components/smart/File/Preview/Context';
import { DecryptionError } from '@misakey/crypto/Errors/classes';

import FileListItem, { FileListItemSkeleton } from 'components/smart/ListItem/File';

// CONSTANTS
export const CELL_HEIGHT = 97;
const INTERNAL_DATA = ['byPagination'];
const ALLOWED_FILE_TYPES_TO_PREVIEW = ['image/'];

// HELPERS
const omitInternalData = (props) => omit(props, INTERNAL_DATA);

// HOOKS
const useMapToFileContext = (vaultKey) => useCallback(
  (encryptedMetadata, createdAt) => {
    const defaultProps = { createdAt, sender: { isFromCurrentUser: true } };

    try {
      const {
        fileSize: size,
        fileName: name,
        fileType: type,
        encryption,
      } = decryptFileMetadataFromVault(encryptedMetadata, vaultKey);

      return { ...defaultProps, name, type, size, encryption };
    } catch (err) {
      log(err);
      return { ...defaultProps, error: new DecryptionError(err) };
    }
  },
  [vaultKey],
);

// COMPONENTS
export const Skeleton = ({ style }) => (
  <FileListItemSkeleton style={style} />
);

Skeleton.propTypes = {
  style: PropTypes.object.isRequired,
};

const VaultCell = ({ style, data, savedFile }) => {
  const vaultKey = useSelector(cryptoSelectors.getVaultKey);
  const identityId = useSelector(authSelectors.identityId);
  const dispatch = useDispatch();
  const { t } = useTranslation('common');

  const {
    encryptedMetadata,
    id,
    encryptedFileId,
    createdAt,
  } = useMemo(() => savedFile || {}, [savedFile]);

  const mapToFileContext = useMapToFileContext(vaultKey);

  const {
    setFileData,
    getFileData,
    getDecryptedFile,
    onOpenFilePreview,
  } = useFilePreviewContext();

  const fileFromContext = getFileData(encryptedFileId);
  const { type, blobUrl, isLoading, error } = useMemo(() => fileFromContext, [fileFromContext]);

  const onClick = useCallback(
    () => {
      onOpenFilePreview(encryptedFileId);
    },
    [encryptedFileId, onOpenFilePreview],
  );

  const onDelete = useCallback(() => deleteSavedFileBuilder(id), [id]);

  const onDeleteSuccess = useCallback(() => {
    dispatch(deleteSavedFile(identityId, id));
  }, [dispatch, id, identityId]);

  const { wrappedFetch: onRemove } = useFetchCallback(
    onDelete,
    { onSuccess: onDeleteSuccess },
  );

  useEffect(
    () => {
      if (isEmpty(fileFromContext) && !isNil(encryptedMetadata)) {
        setFileData(encryptedFileId, mapToFileContext(encryptedMetadata, createdAt));
      }
    },
    [createdAt, encryptedFileId, encryptedMetadata, fileFromContext, mapToFileContext, setFileData],
  );

  const isTypeAllowedForPreview = useMemo(
    () => !isNil(type) && ALLOWED_FILE_TYPES_TO_PREVIEW.some(
      (elem) => type.startsWith(elem),
    ),
    [type],
  );

  const shouldLoadPreview = useMemo(
    () => isTypeAllowedForPreview && !isNil(encryptedFileId)
      && isNil(blobUrl) && !isLoading && isNil(error),
    [blobUrl, encryptedFileId, error, isLoading, isTypeAllowedForPreview],
  );

  const loadFile = useCallback(
    () => {
      execWithRequestIdleCallback(() => getDecryptedFile(encryptedFileId));
    },
    [encryptedFileId, getDecryptedFile],
  );

  useFetchEffect(loadFile, { shouldFetch: shouldLoadPreview, fetchOnlyOnce: true });

  return (
    <FileListItem
      style={style}
      file={fileFromContext}
      actions={[{ onClick: onRemove, text: t('common:remove') }]}
      onClick={onClick}
      key={id}
      {...omitInternalData(data)}
    />
  );
};

VaultCell.propTypes = {
  style: PropTypes.object.isRequired,
  itemIndex: PropTypes.number.isRequired,
  data: PropTypes.object,
  // CONNECT
  savedFile: PropTypes.shape(SavedFilesSchema.propTypes),
  id: PropTypes.string,
};

VaultCell.defaultProps = {
  data: {},
  savedFile: null,
  id: null,
};

// CONNECT
const mapStateToProps = (state, { itemIndex, data: { byPagination } }) => {
  const id = byPagination[itemIndex];
  const savedFile = !isNil(id) ? denormalize(id, SavedFilesSchema.entity, state.entities) : null;
  return { id, savedFile };
};

export default connect(mapStateToProps, null)(VaultCell);
