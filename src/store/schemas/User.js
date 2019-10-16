import { schema } from 'normalizr';
import PropTypes from 'prop-types';

const entity = new schema.Entity('users', {});
const collection = [entity];

const UserSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
  },
};

export default UserSchema;
