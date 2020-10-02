import React, { useMemo, useCallback, useState, forwardRef } from 'react';
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
import BoxFile from 'components/dumb/Box/File';
import withContextMenu from '@misakey/ui/Menu/ContextMenu/with';
import MenuItemEventDelete from 'components/smart/MenuItem/Event/Delete';
import MenuItemEventDownload from 'components/smart/MenuItem/Event/Download';

import ButtonBase from '@material-ui/core/ButtonBase';
import useSaveFileInVault from 'hooks/useSaveFileInVault';

// HOOKS
const useStyles = makeStyles((theme) => ({
  filePreview: {
    border: `1px solid ${theme.palette.divider}`,
    borderTopLeftRadius: 'inherit',
    borderTopRightRadius: 'inherit',
    backgroundColor: theme.palette.background.default,
    minWidth: 150,
    width: '100%',
  },
}));

// COMPONENTS
const EventCardWithContextMenu = withContextMenu(EventCard);

const FileCardEvent = forwardRef(({
  sender,
  isFromCurrentUser,
  boxBelongsToCurrentUser,
  text,
  decryptedContent,
  encryptedFileId,
  event,
  box,
  ...props
}, ref) => {
  const classes = useStyles();
  const [isFilePreviewOpened, setIsFilePreviewOpened] = useState(false);

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

  const onClick = useMemo(
    () => {
      if (isEmpty(decryptedContent)) {
        return null;
      }
      return openFilePreview;
    },
    [decryptedContent, openFilePreview],
  );

  const items = useMemo(
    () => {
      if (!isClosed && (isFromCurrentUser || boxBelongsToCurrentUser)) {
        return [
          <MenuItemEventDownload {...decryptedContent} encryptedFileId={encryptedFileId} key="download" />,
          <MenuItemEventDelete event={event} box={box} key="delete" />,
        ];
      }
      return [
        <MenuItemEventDownload {...decryptedContent} encryptedFileId={encryptedFileId} key="download" />,
      ];
    },
    [
      isClosed, isFromCurrentUser, boxBelongsToCurrentUser,
      decryptedContent, encryptedFileId, event, box,
    ],
  );

  return (
    <>
      <EventCardWithContextMenu
        author={sender}
        date={date}
        isFromCurrentUser={isFromCurrentUser}
        text={text}
        ref={ref}
        items={items}
        {...omitTranslationProps(props)}
      >
        <ButtonBase
          className={clsx(classes.filePreview)}
          onClick={onClick}
          onTouchStart={eventStopPropagation}
          disabled={isNil(onClick)}
        >
          <BoxFile
            fileName={fileName}
            fileType={fileType}
            fileSize={fileSize}
          />
        </ButtonBase>
      </EventCardWithContextMenu>
      <DialogFilePreview
        open={isFilePreviewOpened}
        fileSize={fileSize}
        fileName={fileName}
        fileType={fileType}
        encryption={encryption}
        encryptedFileId={encryptedFileId}
        onClose={onCloseFilePreview}
        onSave={onSaveInVault}
      />
    </>
  );
});

FileCardEvent.propTypes = {
  isFromCurrentUser: PropTypes.bool,
  boxBelongsToCurrentUser: PropTypes.bool,
  text: PropTypes.string.isRequired,
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
  boxBelongsToCurrentUser: false,
  decryptedContent: {},
};

export default FileCardEvent;
