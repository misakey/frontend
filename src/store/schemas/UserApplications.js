import { schema } from 'normalizr';
import PropTypes from 'prop-types';
import ApplicationSchema from 'store/schemas/Application';

// SCHEMA
const entity = new schema.Entity(
  'userApplications',
  { applications: ApplicationSchema.collection },
  { idAttribute: 'workspace' },
);

const collection = [entity];

const UserApplicationsSchema = {
  entity,
  collection,
  propTypes: {
    workspace: PropTypes.string,
    // eslint-disable-next-line react/forbid-foreign-prop-types
    applications: PropTypes.arrayOf(PropTypes.shape(ApplicationSchema.propTypes)),
  },
};

export default UserApplicationsSchema;
