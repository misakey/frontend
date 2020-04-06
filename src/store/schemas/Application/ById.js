import { schema } from 'normalizr';
import PropTypes from 'prop-types';
import ApplicationSchema from 'store/schemas/Application';

const entity = new schema.Entity('applicationsById', { application: ApplicationSchema.entity }, { idAttribute: 'id' });
const collection = [entity];

const ApplicationByIdSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string,
    // eslint-disable-next-line react/forbid-foreign-prop-types
    application: PropTypes.shape(ApplicationSchema.propTypes),
  },
};

export default ApplicationByIdSchema;
