import { schema } from 'normalizr';
import PropTypes from 'prop-types';

const entity = new schema.Entity('organizations');

const collection = [entity];

const OrganizationsSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    creatorId: PropTypes.string,
    logoUrl: PropTypes.string,
    currentIdentityRole: PropTypes.oneOf(['admin', 'agent', null]),
    createdAt: PropTypes.string,
  },
};

export default OrganizationsSchema;
