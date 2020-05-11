import { schema } from 'normalizr';
import PropTypes from 'prop-types';
import ApplicationSchema from 'store/schemas/Application';
import ApplicationByIdSchema from 'store/schemas/Application/ById';

// SCHEMA
const entity = new schema.Entity(
  'applicationsByCategories',
  {
    applications: ApplicationSchema.collection,
    applicationsById: ApplicationByIdSchema.collection,
  },
  {
    idAttribute: 'identifier',
    processStrategy: ({ applications, ...props }) => {
      const applicationsById = applications
        .map(({ id, ...rest }) => ({ id, application: { id, ...rest } }));
      return {
        applications,
        applicationsById,
        ...props,
      };
    },
  },
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
