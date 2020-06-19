import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import numbro from 'numbro';
import { withTranslation } from 'react-i18next';

import { FILE_SIZE_FORMAT } from 'constants/formats/numbers';
import EventCard from 'components/dumb/Event/Card';
import ButtonDownloadBlob from 'components/smart/Button/Download/Blob';

import EventSchema from 'store/schemas/Boxes/Events';

const BoxMessageFileEvent = ({ event, isFromCurrentUser, preview, t, ...rest }) => {
  const { sender, content } = useMemo(() => event, [event]);
  const { displayName } = useMemo(() => sender || {}, [sender]);
  const { blob } = useMemo(() => content || {}, [content]);

  const text = useMemo(() => {
    const { id: blobId, fileExtension, contentLength } = blob || {};
    return `${blobId}${fileExtension} (${numbro(contentLength).format(FILE_SIZE_FORMAT)})`;
  }, [blob]);

  if (preview) {
    return t(
      `boxes:list.events.preview.message.${isFromCurrentUser ? 'you' : 'they'}`,
      { displayName, text },
    );
  }

  return (
    <EventCard
      author={sender}
      isFromCurrentUser={isFromCurrentUser}
      text={text}
      actions={(
        <ButtonDownloadBlob
          key={`download-blob-${blob.id}`}
          blob={blob}
        />
      )}
      {...rest}
    />
  );
};

BoxMessageFileEvent.propTypes = {
  isFromCurrentUser: PropTypes.bool,
  preview: PropTypes.bool,
  event: PropTypes.shape(EventSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

BoxMessageFileEvent.defaultProps = {
  isFromCurrentUser: false,
  preview: false,
};

export default withTranslation('boxes')(BoxMessageFileEvent);
