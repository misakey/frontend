import { schema } from 'normalizr';
import PropTypes from 'prop-types';

const entity = new schema.Entity('services', {}, { idAttribute: 'mainDomain' });
const collection = [entity];

const ServiceSchema = {
  entity,
  collection,
  propTypes: {
    mainDomain: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  },
};

export default ServiceSchema;
