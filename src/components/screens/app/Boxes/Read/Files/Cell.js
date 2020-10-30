import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { denormalize } from 'normalizr';

import BoxEventsSchema from 'store/schemas/Boxes/Events';
import { DecryptionError } from '@misakey/crypto/Errors/classes';

import isNil from '@misakey/helpers/isNil';
import omit from '@misakey/helpers/omit';
import isEmpty from '@misakey/helpers/isEmpty';
import execWithRequestIdleCallback from '@misakey/helpers/execWithRequestIdleCallback';

import FileListItem, { FileListItemSkeleton } from 'components/smart/ListItem/File';
import { useFilePreviewContext } from 'components/smart/File/Preview/Context';
import { useBoxReadContext } from 'components/smart/Context/Boxes/BoxRead';
import MenuItemEventDelete from 'components/smart/MenuItem/Event/Delete';
import MenuItemAddFileToVault from 'components/smart/MenuItem/Event/AddToVault';
import MenuItemEventDownload from 'components/smart/MenuItem/Event/Download';

import decryptFileMsg from '@misakey/crypto/box/decryptFileMsg';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useEventBelongsToCurrentUser from 'hooks/useEventBelongsToCurrentUser';
import usePropChanged from '@misakey/hooks/usePropChanged';

// CONSTANTS
export const CELL_HEIGHT = 115;
const INTERNAL_DATA = ['byPagination'];
const ALLOWED_FILE_TYPES_TO_PREVIEW = ['image/'];

// HELPERS
const omitInternalData = (props) => omit(props, INTERNAL_DATA);

// HOOKS
const useMapEventToFileContext = (
  { content, serverEventCreatedAt, sender, isFromCurrentUser },
  secretKey,
) => useCallback(
  () => {
    const { encrypted, encryptedFileId } = content || {};
    const defaultProps = {
      createdAt: serverEventCreatedAt,
      sender: { ...sender, isFromCurrentUser },
    };

    try {
      if (isNil(secretKey) || isNil(encrypted)) { throw new DecryptionError(); }
      const { fileName, fileType, fileSize, encryption } = decryptFileMsg(encrypted, secretKey);
      return {
        ...defaultProps,
        id: encryptedFileId,
        name: fileName,
        type: fileType,
        size: fileSize,
        encryption,
      };
    } catch (err) {
      return { ...defaultProps, error: new DecryptionError() };
    }
  },
  [content, isFromCurrentUser, secretKey, sender, serverEventCreatedAt],
);


// COMPONENTS
export const Skeleton = ({ style }) => (
  <FileListItemSkeleton style={style} />
);

Skeleton.propTypes = {
  style: PropTypes.object.isRequired,
};

const Cell = ({ style, data, event }) => {
  const {
    getFileData,
    setFileData,
    onSaveFileInVault,
    onDownloadFile,
    disableOnSave,
    onOpenFilePreview,
    getDecryptedFile,
  } = useFilePreviewContext();

  const { secretKey, id: boxId, isCurrentUserOwner, isClosed } = useBoxReadContext();
  const isEventFromCurrentUser = useEventBelongsToCurrentUser(event);

  const { content, serverEventCreatedAt, sender } = useMemo(() => event, [event]);

  const mapEventToFileContext = useMapEventToFileContext(
    { content, serverEventCreatedAt, sender, isFromCurrentUser: isEventFromCurrentUser },
    secretKey,
  );

  const { id: fileId, ...fileData } = useMemo(
    () => mapEventToFileContext(),
    [mapEventToFileContext],
  );
  const [contentChanged, resetContentChanged] = usePropChanged(content);

  const file = getFileData(fileId);
  const { type, blobUrl, isLoading, error } = useMemo(() => file, [file]);

  const onSave = useCallback(
    () => onSaveFileInVault(fileId),
    [fileId, onSaveFileInVault],
  );

  const onDownload = useCallback(
    () => onDownloadFile(fileId),
    [fileId, onDownloadFile],
  );

  const hasWriteAccess = useMemo(
    () => !isClosed && (isEventFromCurrentUser || isCurrentUserOwner),
    [isClosed, isCurrentUserOwner, isEventFromCurrentUser],
  );

  const actions = useMemo(
    () => {
      const disabled = !isNil(error);
      const defaultOptions = [
        { component: MenuItemEventDownload, key: 'download', onDownload, disabled },
        { component: MenuItemAddFileToVault, key: 'vault', onSave, disabled },
      ];
      if (hasWriteAccess) {
        return ([
          ...defaultOptions,
          { component: MenuItemEventDelete, key: 'delete', event, boxId, disabled },
        ]);
      }
      return defaultOptions;
    },
    [error, hasWriteAccess, onDownload, onSave, event, boxId],
  );

  const onClick = useCallback(() => onOpenFilePreview(fileId), [fileId, onOpenFilePreview]);

  const isTypeAllowedForPreview = useMemo(
    () => !isNil(type) && ALLOWED_FILE_TYPES_TO_PREVIEW.some(
      (elem) => type.startsWith(elem),
    ),
    [type],
  );

  const shouldLoadPreview = useMemo(
    () => isTypeAllowedForPreview && !isNil(fileId) && isNil(blobUrl) && !isLoading && isNil(error),
    [blobUrl, error, fileId, isLoading, isTypeAllowedForPreview],
  );

  const loadFile = useCallback(
    () => {
      execWithRequestIdleCallback(() => getDecryptedFile(fileId));
    },
    [fileId, getDecryptedFile],
  );

  useEffect(
    () => {
      if (!isEmpty(fileData) && (isEmpty(file) || contentChanged)) {
        setFileData(fileId, fileData);
        resetContentChanged();
      }
    },
    [contentChanged, file, fileData, fileId, resetContentChanged, setFileData],
  );

  useFetchEffect(loadFile, { shouldFetch: shouldLoadPreview, fetchOnlyOnce: true });

  return (
    <FileListItem
      style={style}
      file={file}
      actions={actions}
      onClick={onClick}
      onSave={!disableOnSave && onSave}
      {...omitInternalData(data)}
    />
  );
};

Cell.propTypes = {
  style: PropTypes.object.isRequired,
  itemIndex: PropTypes.number.isRequired,
  data: PropTypes.object,
  // CONNECT
  event: PropTypes.shape(BoxEventsSchema.propTypes),
  id: PropTypes.string,
};

Cell.defaultProps = {
  data: {},
  event: null,
  id: null,
};

// CONNECT
const mapStateToProps = (state, { itemIndex, data: { byPagination } }) => {
  const id = byPagination[itemIndex];
  const event = !isNil(id) ? denormalize(id, BoxEventsSchema.entity, state.entities) : null;
  return { id, event };
};

export default connect(mapStateToProps, null)(Cell);
