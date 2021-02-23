import { schema } from 'normalizr';
import PropTypes from 'prop-types';

import ROLES from '@misakey/ui/constants/organizations/roles';

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
    currentIdentityRole: PropTypes.oneOf(ROLES),
    createdAt: PropTypes.string,
  },
};

export default OrganizationsSchema;
