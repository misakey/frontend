import React, { useMemo, useCallback, useState, useRef } from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { TIME } from 'constants/formats/dates';
import EventSchema from 'store/schemas/Boxes/Events';
import BoxesSchema from 'store/schemas/Boxes';

import isNil from '@misakey/helpers/isNil';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import isEmpty from '@misakey/helpers/isEmpty';
import eventStopPropagation from '@misakey/helpers/event/stopPropagation';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { useDateFormatMemo } from '@misakey/hooks/useDateFormat';

import EventCardWithMenu from 'components/dumb/Card/Event/WithMenu';
import MenuItemEventDelete from 'components/smart/MenuItem/Event/Delete';
import MenuItemAddFileToVault from 'components/smart/MenuItem/Event/AddToVault';
import MenuItemEventDownload from 'components/smart/MenuItem/Event/Download';
import execWithRequestIdleCallback from '@misakey/helpers/execWithRequestIdleCallback';
import ButtonBase from '@material-ui/core/ButtonBase';
import Skeleton from '@material-ui/lab/Skeleton';

import FilePreview from 'components/smart/File/Preview';
import useIntersectionObserver from '@misakey/hooks/useIntersectionObserver';
import BoxFile from 'components/dumb/Box/File';
import { useFilePreviewContext } from 'components/smart/File/Preview/Context';

// HOOKS
const useStyles = makeStyles((theme) => ({
  filePreview: {
    boxShadow: theme.shadows[1],
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.default,
    minWidth: 50,
    width: '100%',
    '&:hover': {
      boxShadow: theme.shadows[4],
      // Reset on touch devices, it doesn't add specificity
      '@media (hover: none)': {
        boxShadow: theme.shadows[1],
      },
    },
    '&:active': {
      boxShadow: theme.shadows[8],
    },
  },
  previewFallback: {
    width: 250,
    height: 200,
    maxWidth: '100%',
  },
  cardContent: {
    padding: theme.spacing(1),
    maxWidth: '100%',
  },
  fallbackTextContainer: {
    maxWidth: '100%',
  },
}));

// CONSTANTS
const ALLOWED_FILE_TYPES_TO_PREVIEW = ['image/'];

const BOX_FILE_TYPO_PROPS = { noWrap: true };

// COMPONENTS
export const FileCardEventSkeleton = ({
  sender,
  isFromCurrentUser, boxBelongsToCurrentUser,
  ...props
}) => (
  <EventCardWithMenu
    author={sender}
    {...omitTranslationProps(props)}
  >
    <BoxFile
      height={200}
      width={250}
      fileName={<Skeleton />}
      isLoading
    />
  </EventCardWithMenu>
);

FileCardEventSkeleton.propTypes = {
  isFromCurrentUser: PropTypes.bool,
  boxBelongsToCurrentUser: PropTypes.bool,
  sender: PropTypes.shape({
    displayName: PropTypes.string,
    avatarUrl: PropTypes.string,
  }).isRequired,
};

FileCardEventSkeleton.defaultProps = {
  isFromCurrentUser: false,
  boxBelongsToCurrentUser: false,
};

const FileCardEvent = ({
  sender,
  isFromCurrentUser,
  boxBelongsToCurrentUser,
  text,
  encryptedFileId,
  event,
  box,
  data,
  ...props
}) => {
  const classes = useStyles();

  const ref = useRef();
  const { t } = useTranslation('common');

  const {
    serverEventCreatedAt,
    content: { decryptedFile },
    id: eventId,
  } = useMemo(() => event, [event]);
  const { isSaved, type, size, name, isLoading, error, encryption, blobUrl } = useMemo(
    () => decryptedFile,
    [decryptedFile],
  );
  const { id: boxId } = useMemo(() => box, [box]);

  const date = useDateFormatMemo(serverEventCreatedAt, TIME);

  const isTypeAllowedForPreview = useMemo(
    () => !isNil(type) && ALLOWED_FILE_TYPES_TO_PREVIEW.some(
      (elem) => type.startsWith(elem),
    ),
    [type],
  );

  const {
    getDecryptedFile,
    onDownloadFile,
    onOpenFilePreview,
    onSaveFileInVault,
  } = useFilePreviewContext();

  const [shouldObserve, setShouldObserve] = useState(isTypeAllowedForPreview && isNil(blobUrl));

  const onDownloadInBrowser = useCallback(
    () => onDownloadFile(decryptedFile),
    [decryptedFile, onDownloadFile],
  );

  const onSave = useCallback(
    () => onSaveFileInVault(decryptedFile),
    [decryptedFile, onSaveFileInVault],
  );

  const hasWriteAccess = useMemo(
    () => isFromCurrentUser || boxBelongsToCurrentUser,
    [boxBelongsToCurrentUser, isFromCurrentUser],
  );

  const items = useMemo(
    () => {
      const disabled = !isNil(error);
      if (hasWriteAccess) {
        return [
          <MenuItemEventDownload key="download" onDownload={onDownloadInBrowser} disabled={disabled} />,
          <MenuItemAddFileToVault key="vault" onSave={onSave} isSaved={isSaved} disabled={disabled} />,
          <MenuItemEventDelete event={event} boxId={boxId} key="delete" />,
        ];
      }
      return [
        <MenuItemEventDownload key="download" onDownload={onDownloadInBrowser} disabled={disabled} />,
        <MenuItemAddFileToVault key="vault" onSave={onSave} isSaved={isSaved} disabled={disabled} />,
      ];
    },
    [error, hasWriteAccess, onDownloadInBrowser, onSave, isSaved, event, boxId],
  );

  const openFilePreview = useCallback(
    () => {
      onOpenFilePreview(encryptedFileId, { ...data, id: eventId });
    },
    [encryptedFileId, onOpenFilePreview, data, eventId],
  );

  const onClick = useMemo(
    () => {
      if (isEmpty(decryptedFile) || !isNil(error)) {
        return null;
      }
      return openFilePreview;
    },
    [decryptedFile, error, openFilePreview],
  );

  const onCardAppeared = useCallback(
    (entry) => {
      if (entry.isIntersecting === true) {
        // download and decrypt are done in background
        execWithRequestIdleCallback(() => getDecryptedFile(encryptedFileId, encryption, name));
        setShouldObserve(false);
      }
    },
    [encryptedFileId, encryption, getDecryptedFile, name],
  );

  useIntersectionObserver(ref, onCardAppeared, shouldObserve);

  return (
    <EventCardWithMenu
      ref={ref}
      author={sender}
      date={date}
      text={text}
      items={items}
      classes={{ content: classes.cardContent }}
      {...omitTranslationProps(props)}
    >
      <ButtonBase
        className={classes.filePreview}
        onClick={onClick}
        onTouchStart={eventStopPropagation}
        disabled={isNil(onClick)}
      >
        <FilePreview
          file={decryptedFile}
          allowedFileTypePreview={ALLOWED_FILE_TYPES_TO_PREVIEW}
          height={200}
          titleOnHover
          fallbackView={(
            <BoxFile
              fileSize={size}
              fileName={name || t('common:loading')}
              fileType={type}
              isLoading={isLoading}
              isBroken={!isNil(error)}
              className={classes.previewFallback}
              maxWidth="100%"
              textContainerProps={{ className: classes.fallbackTextContainer }}
              typographyProps={BOX_FILE_TYPO_PROPS}
            />
          )}
        />
      </ButtonBase>
    </EventCardWithMenu>
  );
};

FileCardEvent.propTypes = {
  isFromCurrentUser: PropTypes.bool,
  boxBelongsToCurrentUser: PropTypes.bool,
  text: PropTypes.string,
  encryptedFileId: PropTypes.string.isRequired,
  sender: PropTypes.shape({
    displayName: PropTypes.string,
    avatarUrl: PropTypes.string,
  }).isRequired,
  event: PropTypes.shape(EventSchema.propTypes).isRequired,
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  data: PropTypes.object,
};

FileCardEvent.defaultProps = {
  isFromCurrentUser: false,
  text: null,
  boxBelongsToCurrentUser: false,
  data: {},
};

export default FileCardEvent;
