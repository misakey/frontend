import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import numbro from 'numbro';

import { FILE_SIZE_FORMAT } from 'constants/formats/numbers';
import EventCard from 'components/dumb/Event/Card';
import ButtonDownloadBlob from 'components/smart/Button/Download/Blob';

import EventSchema from 'store/schemas/Boxes/Events';

const BoxMessageFileEvent = ({ event, isFromCurrentUser, ...rest }) => {
  const { sender, content } = useMemo(() => event, [event]);
  const { blob } = useMemo(() => content || {}, [content]);

  const text = useMemo(() => {
    const { id: blobId, fileExtension, contentLength } = blob || {};
    return `${blobId}${fileExtension} (${numbro(contentLength).format(FILE_SIZE_FORMAT)})`;
  }, [blob]);

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
  event: PropTypes.shape(EventSchema.propTypes).isRequired,
};

BoxMessageFileEvent.defaultProps = {
  isFromCurrentUser: false,
};

export default BoxMessageFileEvent;
