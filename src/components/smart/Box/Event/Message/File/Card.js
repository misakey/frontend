import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { TIME } from 'constants/formats/dates';
import { CLOSED } from 'constants/app/boxes/statuses';
import EventSchema from 'store/schemas/Boxes/Events';
import BoxesSchema from 'store/schemas/Boxes';

import isNil from '@misakey/helpers/isNil';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import isEmpty from '@misakey/helpers/isEmpty';
import eventStopPropagation from '@misakey/helpers/event/stopPropagation';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { useDateFormatMemo } from '@misakey/hooks/useDateFormat';

import EventCard from 'components/dumb/Card/Event';
import withContextMenu from '@misakey/ui/Menu/ContextMenu/with';
import MenuItemEventDelete from 'components/smart/MenuItem/Event/Delete';
import MenuItemAddFileToVault from 'components/smart/MenuItem/Event/AddToVault';
import MenuItemEventDownload from 'components/smart/MenuItem/Event/Download';
import execWithRequestIdleCallback from '@misakey/helpers/execWithRequestIdleCallback';
import ButtonBase from '@material-ui/core/ButtonBase';

import FilePreview from 'components/smart/File/Preview';
import useIntersectionObserver from '@misakey/hooks/useIntersectionObserver';
import BoxFile from 'components/dumb/Box/File';
import { useFilePreviewContext } from 'components/smart/File/Preview/Context';

// HOOKS
const useStyles = makeStyles((theme) => ({
  filePreview: {
    border: `1px solid ${theme.palette.divider}`,
    borderTopLeftRadius: 'inherit',
    borderTopRightRadius: 'inherit',
    backgroundColor: theme.palette.background.default,
    minWidth: 50,
    width: '100%',
  },
  previewFallback: {
    width: 250,
    height: 200,
  },
}));

// CONSTANTS
const ALLOWED_FILE_TYPES_TO_PREVIEW = ['image/'];

// COMPONENTS
const EventCardWithContextMenu = withContextMenu(EventCard);

const FileCardEvent = ({
  sender,
  isFromCurrentUser,
  boxBelongsToCurrentUser,
  text,
  decryptedContent,
  encryptedFileId,
  event,
  box,
  ...props
}) => {
  const classes = useStyles();

  const ref = useRef();

  const { serverEventCreatedAt } = useMemo(() => event, [event]);
  const { lifecycle, id: boxId } = useMemo(() => box, [box]);

  const isClosed = useMemo(
    () => lifecycle === CLOSED,
    [lifecycle],
  );
  const date = useDateFormatMemo(serverEventCreatedAt, TIME);

  const {
    fileSize,
    fileType,
    fileName,
    encryption,
  } = useMemo(() => decryptedContent, [decryptedContent]);

  const isTypeAllowedForPreview = useMemo(
    () => !isNil(fileType) && ALLOWED_FILE_TYPES_TO_PREVIEW.some(
      (type) => fileType.startsWith(type),
    ),
    [fileType],
  );

  const {
    setFileData,
    getFileData,
    getDecryptedFile,
    onDownloadFile,
    onOpenFilePreview,
    onSaveFileInVault,
  } = useFilePreviewContext();

  const file = getFileData(encryptedFileId);
  const { isLoading, error, name } = useMemo(() => file, [file]);

  const [shouldObserve, setShouldObserve] = useState(false);

  const onDownloadInBrowser = useCallback(
    () => onDownloadFile(encryptedFileId),
    [encryptedFileId, onDownloadFile],
  );

  const onSave = useCallback(
    () => onSaveFileInVault(encryptedFileId),
    [encryptedFileId, onSaveFileInVault],
  );

  const hasWriteAccess = useMemo(
    () => !isClosed && (isFromCurrentUser || boxBelongsToCurrentUser),
    [boxBelongsToCurrentUser, isClosed, isFromCurrentUser],
  );

  const items = useMemo(
    () => {
      const disabled = !isNil(error);
      if (hasWriteAccess) {
        return [
          <MenuItemEventDownload key="download" onDownload={onDownloadInBrowser} disabled={disabled} />,
          <MenuItemAddFileToVault key="vault" onSave={onSave} disabled={disabled} />,
          <MenuItemEventDelete event={event} boxId={boxId} key="delete" />,
        ];
      }
      return [
        <MenuItemEventDownload key="download" onDownload={onDownloadInBrowser} disabled={disabled} />,
        <MenuItemAddFileToVault key="vault" onSave={onSave} disabled={disabled} />,
      ];
    },
    [error, hasWriteAccess, onDownloadInBrowser, onSave, event, boxId],
  );

  const openFilePreview = useCallback(
    () => {
      onOpenFilePreview(encryptedFileId);
    },
    [encryptedFileId, onOpenFilePreview],
  );

  useEffect(
    () => {
      if (isEmpty(file)) {
        const fileData = {
          name: fileName,
          type: fileType,
          size: fileSize,
          createdAt: serverEventCreatedAt,
          sender,
          encryption,
        };
        setFileData(encryptedFileId, fileData);
        setShouldObserve(isTypeAllowedForPreview);
      }
    },
    [decryptedContent, encryptedFileId,
      encryption, error, file, fileName, fileSize, fileType, getFileData,
      isTypeAllowedForPreview, name, sender,
      serverEventCreatedAt, setFileData],
  );

  const onClick = useMemo(
    () => {
      if (isEmpty(file) || !isNil(error)) {
        return null;
      }
      return openFilePreview;
    },
    [error, file, openFilePreview],
  );

  const onCardAppeared = useCallback(
    (entry) => {
      if (entry.isIntersecting === true) {
        // download and decrypt are done in background
        execWithRequestIdleCallback(() => getDecryptedFile(encryptedFileId));
        setShouldObserve(false);
      }
    },
    [encryptedFileId, getDecryptedFile],
  );

  useIntersectionObserver(ref, onCardAppeared, shouldObserve);

  return (
    <EventCardWithContextMenu
      ref={ref}
      author={sender}
      date={date}
      isFromCurrentUser={isFromCurrentUser}
      text={text}
      items={items}
      disableMaxWidth={isTypeAllowedForPreview}
      {...omitTranslationProps(props)}
    >
      <ButtonBase
        className={clsx(classes.filePreview)}
        onClick={onClick}
        onTouchStart={eventStopPropagation}
        disabled={isNil(onClick)}
      >
        <FilePreview
          file={file}
          allowedFileTypePreview={ALLOWED_FILE_TYPES_TO_PREVIEW}
          height={200}
          fallbackView={(
            <BoxFile
              fileSize={fileSize}
              fileName={fileName}
              fileType={fileType}
              isLoading={isLoading}
              isBroken={!isNil(error)}
              className={classes.previewFallback}
            />
          )}
        />
      </ButtonBase>
    </EventCardWithContextMenu>
  );
};

FileCardEvent.propTypes = {
  isFromCurrentUser: PropTypes.bool,
  boxBelongsToCurrentUser: PropTypes.bool,
  text: PropTypes.string,
  decryptedContent: PropTypes.object,
  encryptedFileId: PropTypes.string.isRequired,
  sender: PropTypes.shape({
    displayName: PropTypes.string,
    avatarUrl: PropTypes.string,
  }).isRequired,
  event: PropTypes.shape(EventSchema.propTypes).isRequired,
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
};

FileCardEvent.defaultProps = {
  isFromCurrentUser: false,
  text: null,
  boxBelongsToCurrentUser: false,
  decryptedContent: {},
};

export default FileCardEvent;
