import { schema } from 'normalizr';
import PropTypes from 'prop-types';
import SavedFilesSchema from '.';

const entity = new schema.Entity('savedFilesByIdentity', {
  savedFiles: SavedFilesSchema.collection,
}, { idAttribute: 'identityId' });

const collection = [entity];

const FileSavedByIdentity = {
  entity,
  collection,
  propTypes: {
    identityId: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-foreign-prop-types
    savedFiles: PropTypes.arrayOf(SavedFilesSchema.propTypes.isRequired),
  },
};

export default FileSavedByIdentity;
