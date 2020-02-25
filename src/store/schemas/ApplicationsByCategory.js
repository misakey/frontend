import { schema } from 'normalizr';
import PropTypes from 'prop-types';
import ApplicationSchema from 'store/schemas/Application';

// SCHEMA
const entity = new schema.Entity(
  'applicationsByCategories',
  { applications: ApplicationSchema.collection },
  { idAttribute: 'identifier' },
);

const collection = [entity];

const ApplicationsByCategorySchema = {
  entity,
  collection,
  propTypes: {
    // eslint-disable-next-line react/forbid-foreign-prop-types
    applications: PropTypes.arrayOf(PropTypes.shape(ApplicationSchema.propTypes)),
    category: PropTypes.string,
  },
};

export default ApplicationsByCategorySchema;
