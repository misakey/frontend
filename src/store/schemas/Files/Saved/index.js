import { schema } from 'normalizr';
import PropTypes from 'prop-types';

const entity = new schema.Entity('savedFiles');

const collection = [entity];

const SavedFilesSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string.isRequired,
    createdAt: PropTypes.string,
    encryptedFileId: PropTypes.string,
    encryptedMetadata: PropTypes.string,
    keyFingerprint: PropTypes.string,
    identityId: PropTypes.string,
  },
};

export default SavedFilesSchema;
