import React, { useCallback, useMemo } from 'react';

import PropTypes from 'prop-types';
import { connect, useSelector } from 'react-redux';
import { denormalize } from 'normalizr';

import BoxEventsSchema from 'store/schemas/Boxes/Events';
import { selectors as cryptoSelectors } from '@misakey/crypto/store/reducers';

import isNil from '@misakey/helpers/isNil';
import omit from '@misakey/helpers/omit';
import execWithRequestIdleCallback from '@misakey/helpers/execWithRequestIdleCallback';


import useFetchEffect from '@misakey/hooks/useFetch/effect';
import useEventBelongsToCurrentUser from 'hooks/useEventBelongsToCurrentUser';
import useDecryptMsgFileEffect from 'hooks/useDecryptMsgFile/effect';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import FileListItem, { FileListItemSkeleton } from 'components/smart/ListItem/File';
import { useFilePreviewContext } from 'components/smart/File/Preview/Context';
import { useBoxReadContext } from 'components/smart/Context/Boxes/BoxRead';
import MenuItemEventDelete from 'components/smart/MenuItem/Event/Delete';
import MenuItemAddFileToVault from 'components/smart/MenuItem/Event/AddToVault';
import MenuItemEventDownload from 'components/smart/MenuItem/Event/Download';

// CONSTANTS
const {
  makeGetAsymSecretKey,
} = cryptoSelectors;

export const CELL_HEIGHT = 115;
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

const Cell = ({ style, data, event }) => {
  const {
    onSaveFileInVault,
    onDownloadFile,
    disableOnSave,
    onOpenFilePreview,
    getDecryptedFile,
  } = useFilePreviewContext();

  const { id: boxId, isCurrentUserOwner } = useBoxReadContext();
  const isEventFromCurrentUser = useEventBelongsToCurrentUser(event);

  const { content, publicKey, id: eventId } = useMemo(() => event, [event]);
  const { decryptedFile, encryptedFileId } = useSafeDestr(content);

  const getAsymSecretKey = useMemo(
    () => makeGetAsymSecretKey(),
    [],
  );
  const secretKey = useSelector((state) => getAsymSecretKey(state, publicKey));

  const {
    id,
    type,
    blobUrl,
    isLoading,
    error,
    isSaved,
    encryption,
    name,
  } = useSafeDestr(decryptedFile);

  const onSave = useCallback(
    () => onSaveFileInVault(decryptedFile),
    [decryptedFile, onSaveFileInVault],
  );

  const onDownload = useCallback(
    () => onDownloadFile(decryptedFile),
    [decryptedFile, onDownloadFile],
  );

  const hasWriteAccess = useMemo(
    () => isEventFromCurrentUser || isCurrentUserOwner,
    [isCurrentUserOwner, isEventFromCurrentUser],
  );

  const actions = useMemo(
    () => {
      const disabled = !isNil(error);
      const defaultOptions = [
        { component: MenuItemEventDownload, key: 'download', onDownload, disabled },
        { component: MenuItemAddFileToVault, key: 'vault', onSave, isSaved, disabled },
      ];
      if (hasWriteAccess) {
        return ([
          ...defaultOptions,
          { component: MenuItemEventDelete, key: 'delete', event, boxId, disabled },
        ]);
      }
      return defaultOptions;
    },
    [error, onDownload, onSave, isSaved, hasWriteAccess, event, boxId],
  );

  const onClick = useCallback(
    () => onOpenFilePreview(encryptedFileId, { ...data, id: eventId }),
    [encryptedFileId, data, eventId, onOpenFilePreview],
  );

  const isTypeAllowedForPreview = useMemo(
    () => !isNil(type) && ALLOWED_FILE_TYPES_TO_PREVIEW.some(
      (elem) => type.startsWith(elem),
    ),
    [type],
  );

  const shouldLoadPreview = useMemo(
    () => isTypeAllowedForPreview && !isNil(id) && isNil(blobUrl) && !isLoading && isNil(error),
    [blobUrl, error, id, isLoading, isTypeAllowedForPreview],
  );

  const loadFile = useCallback(
    () => {
      execWithRequestIdleCallback(() => getDecryptedFile(id, encryption, name));
    },
    [getDecryptedFile, id, encryption, name],
  );

  useDecryptMsgFileEffect(event, secretKey, isEventFromCurrentUser);

  useFetchEffect(loadFile, { shouldFetch: shouldLoadPreview, fetchOnlyOnce: true });

  return (
    <FileListItem
      style={style}
      file={decryptedFile}
      actions={actions}
      onClick={onClick}
      onSave={disableOnSave ? null : onSave}
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

export default connect(mapStateToProps)(Cell);
