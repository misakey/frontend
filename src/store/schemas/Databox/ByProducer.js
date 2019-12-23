import { schema } from 'normalizr';
import PropTypes from 'prop-types';
import ApplicationSchema from 'store/schemas/Application';
import DataboxSchema from 'store/schemas/Databox';

const entity = new schema.Entity('databoxesByProducer', { databoxes: DataboxSchema.collection }, {
  idAttribute: 'producerId',
});
const collection = [entity];

const DataboxByProducerSchema = {
  entity,
  collection,
  propTypes: {
    // eslint-disable-next-line react/forbid-foreign-prop-types
    producerId: ApplicationSchema.propTypes.id.isRequired,
    // eslint-disable-next-line react/forbid-foreign-prop-types
    databoxes: PropTypes.arrayOf(PropTypes.shape(DataboxSchema.propTypes)),
  },
};

export default DataboxByProducerSchema;
