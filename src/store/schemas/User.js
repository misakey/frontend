import { schema } from 'normalizr';
import PropTypes from 'prop-types';

import { NOTIFICATIONS } from 'constants/notifications';

const entity = new schema.Entity('users', {});
const collection = [entity];

const UserSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    handle: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string,
    notifications: PropTypes.oneOf(NOTIFICATIONS),
  },
};

export default UserSchema;
