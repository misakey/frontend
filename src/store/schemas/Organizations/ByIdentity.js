import { schema } from 'normalizr';
import PropTypes from 'prop-types';
import OrganizationsSchema from 'store/schemas/Organizations';

const entity = new schema.Entity('identityOrganizations', {
  organizations: OrganizationsSchema.collection,
});

const collection = [entity];

const IdentityOrganizationsSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-foreign-prop-types
    organizations: PropTypes.shape(OrganizationsSchema.propTypes),
  },
};

export default IdentityOrganizationsSchema;
