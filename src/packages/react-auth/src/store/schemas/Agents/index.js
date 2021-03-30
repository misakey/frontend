import { schema } from 'normalizr';
import PropTypes from 'prop-types';
import UserSchema from '@misakey/react-auth/store/schemas/User';

const entity = new schema.Entity('agents', {
  identity: UserSchema.entity,
}, {});

const collection = [entity];

const AgentSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string.isRequired,
    organizationId: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-foreign-prop-types
    identity: PropTypes.shape(UserSchema.propTypes).isRequired,
  },
};

export default AgentSchema;
