import { schema } from 'normalizr';
import PropTypes from 'prop-types';
import AgentsSchema from '@misakey/react/auth/store/schemas/Agents';

import isNil from '@misakey/core/helpers/isNil';

const entity = new schema.Entity('organizationAgents', {
  agents: AgentsSchema.collection,
}, {
  idAttribute: ({ id }) => {
    if (isNil(id)) {
      return window.env.SELF_CLIENT_ID;
    }
    return id;
  },
});

const collection = [entity];

const OrganizationAgentsSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-foreign-prop-types
    agents: PropTypes.shape(AgentsSchema.propTypes),
  },
};

export default OrganizationAgentsSchema;
