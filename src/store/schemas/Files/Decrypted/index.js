import { schema } from 'normalizr';
import PropTypes from 'prop-types';
import UserSchema from '@misakey/react/auth/store/schemas/User';

const entity = new schema.Entity('decryptedFiles');

const collection = [entity];

const DecryptedFileSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string.isRequired,
    blobUrl: PropTypes.string,
    isSaved: PropTypes.bool,
    name: PropTypes.string,
    type: PropTypes.string,
    encryption: PropTypes.object,
    isLoading: PropTypes.bool,
    createdAt: PropTypes.string,
    // eslint-disable-next-line react/forbid-foreign-prop-types
    sender: PropTypes.shape(UserSchema.propTypes),
    error: PropTypes.object,
  },
};

export default DecryptedFileSchema;
