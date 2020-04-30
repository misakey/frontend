
import { schema } from 'normalizr';
import PropTypes from 'prop-types';

const entity = new schema.Entity('blobs');

const collection = [entity];

const BlobSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string,
    databoxId: PropTypes.string,
    blobUrl: PropTypes.string,
    createdAt: PropTypes.string,
    dataType: PropTypes.string,
    contentLength: PropTypes.number,
    fileExtension: PropTypes.string,
    transactionId: PropTypes.string,
    encryption: PropTypes.shape({
      algorithm: PropTypes.string,
      nonce: PropTypes.string,
      ephemeralProducerPubKey: PropTypes.string,
      ownerPubKey: PropTypes.string,
    }),
  },
};

export default BlobSchema;
