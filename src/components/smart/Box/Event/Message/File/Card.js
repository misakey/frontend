import React, { useMemo, useCallback, useState, useRef } from 'react';
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

import DialogFilePreview from 'components/smart/Dialog/FilePreview';
import EventCard from 'components/dumb/Card/Event';
import withContextMenu from '@misakey/ui/Menu/ContextMenu/with';
import MenuItemEventDelete from 'components/smart/MenuItem/Event/Delete';
import MenuItemAddFileToVault from 'components/smart/MenuItem/Event/AddToVault';
import MenuItemEventDownload from 'components/smart/MenuItem/Event/Download';
import execWithRequestIdleCallback from '@misakey/helpers/execWithRequestIdleCallback';
import ButtonBase from '@material-ui/core/ButtonBase';
import useSaveFileInVault from 'hooks/useSaveFileInVault';

import FileContextProvider, { useFileContext } from 'components/smart/File/Context';
import FilePreview from 'components/smart/File/Preview';
import useIntersectionObserver from '@misakey/hooks/useIntersectionObserver';
import BoxFile from 'components/dumb/Box/File';

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
  const [isFilePreviewOpened, setIsFilePreviewOpened] = useState(false);

  const ref = useRef();

  const { serverEventCreatedAt } = useMemo(() => event, [event]);
  const { lifecycle } = useMemo(() => box, [box]);

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

  const [shouldObserve, setShouldObserve] = useState(isTypeAllowedForPreview);

  const onSaveInVault = useSaveFileInVault(
    { encryption, fileSize, fileName, fileType }, encryptedFileId,
  );

  const openFilePreview = useCallback(
    () => {
      setIsFilePreviewOpened(true);
    },
    [],
  );

  const onCloseFilePreview = useCallback(
    () => {
      setIsFilePreviewOpened(false);
    },
    [],
  );

  const items = useMemo(
    () => {
      if (!isClosed && (isFromCurrentUser || boxBelongsToCurrentUser)) {
        return [
          <MenuItemEventDownload key="download" />,
          <MenuItemAddFileToVault key="vault" onSave={onSaveInVault} />,
          <MenuItemEventDelete event={event} box={box} key="delete" />,
        ];
      }
      return [
        <MenuItemEventDownload key="download" />,
        <MenuItemAddFileToVault key="vault" onSave={onSaveInVault} />,
      ];
    },
    [isClosed, isFromCurrentUser, boxBelongsToCurrentUser, onSaveInVault, event, box],
  );

  const { getDecryptedFile, error, isLoading } = useFileContext();

  const onClick = useMemo(
    () => {
      if (isEmpty(decryptedContent) || !isNil(error)) {
        return null;
      }
      return openFilePreview;
    },
    [decryptedContent, error, openFilePreview],
  );

  const onCardAppeared = useCallback(
    (entry) => {
      if (entry.isIntersecting === true) {
        // download and decrypt are done in background
        execWithRequestIdleCallback(getDecryptedFile);
        setShouldObserve(false);
      }
    },
    [getDecryptedFile],
  );

  useIntersectionObserver(ref, onCardAppeared, shouldObserve);

  return (
    <>
      <EventCardWithContextMenu
        author={sender}
        date={date}
        isFromCurrentUser={isFromCurrentUser}
        text={text}
        ref={ref}
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
      <DialogFilePreview
        open={isFilePreviewOpened}
        onClose={onCloseFilePreview}
        onSave={onSaveInVault}
      />
    </>
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

const FileCardEventWithContext = ({ encryptedFileId, decryptedContent, ...props }) => (
  <FileContextProvider
    decryptedContent={decryptedContent}
    encryptedFileId={encryptedFileId}
  >
    <FileCardEvent
      decryptedContent={decryptedContent}
      encryptedFileId={encryptedFileId}
      {...props}
    />
  </FileContextProvider>
);

FileCardEventWithContext.propTypes = {
  decryptedContent: PropTypes.object,
  encryptedFileId: PropTypes.string.isRequired,
};

FileCardEventWithContext.defaultProps = {
  decryptedContent: {},
};

export default FileCardEventWithContext;
