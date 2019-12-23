import { schema } from 'normalizr';
import PropTypes from 'prop-types';

const entity = new schema.Entity('databoxes', {});
const collection = [entity];

const DataboxSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string.isRequired,
    ownerId: PropTypes.string,
    producerId: PropTypes.string.isRequired,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
  },
};

export default DataboxSchema;
