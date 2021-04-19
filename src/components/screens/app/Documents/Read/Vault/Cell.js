import React, { useMemo, useCallback } from 'react';

import PropTypes from 'prop-types';
import { useSelector, useDispatch, connect } from 'react-redux';
import { denormalize } from 'normalizr';

import SavedFilesSchema from 'store/schemas/Files/Saved';
import { selectors as cryptoSelectors } from '@misakey/react/crypto/store/reducers';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import isNil from '@misakey/core/helpers/isNil';
import omit from '@misakey/core/helpers/omit';
import execWithRequestIdleCallback from '@misakey/core/helpers/execWithRequestIdleCallback';
import { deleteSavedFileBuilder } from '@misakey/core/api/helpers/builder/vault';
import { deleteSavedFile } from 'store/reducers/files/saved';

import { useFilePreviewContext } from 'components/smart/File/Preview/Context';
import useFetchCallback from '@misakey/hooks/useFetch/callback';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useDecryptSavedFileEffect from 'hooks/useDecryptSavedFile/effect';

import MenuItem from '@material-ui/core/MenuItem';
import MenuItemEventDownload from 'components/smart/MenuItem/Event/Download';
import MenuItemEventRemoveFromVault from 'components/smart/MenuItem/Event/RemoveFromVault';
import FileListItem, { FileListItemSkeleton } from 'components/smart/ListItem/File';

// CONSTANTS
export const CELL_HEIGHT = 97;
const INTERNAL_DATA = ['byPagination', 'loadMoreItems'];
const ALLOWED_FILE_TYPES_TO_PREVIEW = ['image/'];

// HELPERS
const omitInternalData = (props) => omit(props, INTERNAL_DATA);

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

  const { id, encryptedFileId, decryptedFile } = useSafeDestr(savedFile);

  useDecryptSavedFileEffect(savedFile, vaultKey);

  const { getDecryptedFile, onOpenFilePreview, onDownloadFile } = useFilePreviewContext();

  const { type, blobUrl, isLoading, error, encryption, name } = useSafeDestr(decryptedFile);

  const onClick = useCallback(
    () => {
      onOpenFilePreview(encryptedFileId, { ...data, id });
    },
    [encryptedFileId, onOpenFilePreview, data, id],
  );

  const onDownload = useCallback(
    () => onDownloadFile(decryptedFile),
    [decryptedFile, onDownloadFile],
  );

  const onDelete = useCallback(() => deleteSavedFileBuilder(id), [id]);

  const onDeleteSuccess = useCallback(() => {
    dispatch(deleteSavedFile(identityId, id));
  }, [dispatch, id, identityId]);

  const { wrappedFetch: onRemove } = useFetchCallback(
    onDelete,
    { onSuccess: onDeleteSuccess },
  );

  const actions = useMemo(
    () => [
      <MenuItemEventDownload component={MenuItem} key="download" onDownload={onDownload} disabled={!isNil(error)} />,
      <MenuItemEventRemoveFromVault component={MenuItem} key="remove" onRemove={onRemove} />,
    ],
    [onDownload, error, onRemove],
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
      execWithRequestIdleCallback(() => getDecryptedFile(encryptedFileId, encryption, name));
    },
    [encryptedFileId, encryption, getDecryptedFile, name],
  );

  useFetchEffect(loadFile, { shouldFetch: shouldLoadPreview, fetchOnlyOnce: true });

  return (
    <FileListItem
      style={style}
      file={decryptedFile}
      actions={actions}
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
// @FIXME rely only on hooks or connect, not both
const mapStateToProps = (state, { itemIndex, data: { byPagination } }) => {
  const id = byPagination[itemIndex];
  const savedFile = !isNil(id) ? denormalize(id, SavedFilesSchema.entity, state.entities) : null;
  return { id, savedFile };
};

export default connect(mapStateToProps, null)(VaultCell);
