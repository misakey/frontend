import { schema } from 'normalizr';
import PropTypes from 'prop-types';

const entity = new schema.Entity('datatags');

const collection = [entity];

const DatatagsSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    createdAt: PropTypes.string,
  },
};

export default DatatagsSchema;
