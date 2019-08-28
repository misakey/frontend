import { schema } from 'normalizr';
import PropTypes from 'prop-types';

const entity = new schema.Entity('services', {}, { idAttribute: 'mainDomain' });
const collection = [entity];

const ServiceSchema = {
  entity,
  collection,
  propTypes: {
    mainDomain: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    dpoEmail: PropTypes.string,
    shortDesc: PropTypes.string,
    longDesc: PropTypes.string,
    domains: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      applicationId: PropTypes.string,
      uri: PropTypes.string,
    })),
  },
};

export default ServiceSchema;
