import { schema } from 'normalizr';
import PropTypes from 'prop-types';

import isNil from '@misakey/helpers/isNil';
import BlobSchema from 'store/schemas/Databox/Blob';


const entity = new schema.Entity('activityLogs', {
  metadata: {
    blob: BlobSchema.entity,
  },
}, {
  processStrategy: (item) => {
    const { metadata } = item;
    const newItem = (!isNil(metadata) && !isNil(metadata.blobId) && isNil(metadata.blob))
      ? { ...item, metadata: { ...metadata, blob: { id: metadata.blobId } } }
      : item;

    return newItem;
  },
});

const collection = [entity];

const ActivityLogsSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.number.isRequired,
    databoxId: PropTypes.string.isRequired,
    authorRole: PropTypes.string.isRequired,
    action: PropTypes.string.isRequired,
    metadata: PropTypes.shape({
      // eslint-disable-next-line react/forbid-foreign-prop-types
      blob: PropTypes.shape(BlobSchema.propTypes),
    }),
    createdAt: PropTypes.string.isRequired,
    author: PropTypes.shape({
      display_name: PropTypes.string,
      avatarUri: PropTypes.string,
    }),
  },
};

export default ActivityLogsSchema;
