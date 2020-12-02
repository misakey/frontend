import { schema } from 'normalizr';
import PropTypes from 'prop-types';
import DecryptedFileSchema from 'store/schemas/Files/Decrypted';

const entity = new schema.Entity('savedFiles', {
  decryptedFile: DecryptedFileSchema.entity,
});

const collection = [entity];

const SavedFilesSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string.isRequired,
    createdAt: PropTypes.string,
    encryptedFileId: PropTypes.string,
    // eslint-disable-next-line react/forbid-foreign-prop-types
    decryptedFile: DecryptedFileSchema.propTypes,
    encryptedMetadata: PropTypes.string,
    keyFingerprint: PropTypes.string,
    identityId: PropTypes.string,
  },
};

export default SavedFilesSchema;
