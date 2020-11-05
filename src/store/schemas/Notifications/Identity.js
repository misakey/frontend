import { schema } from 'normalizr';
import PropTypes from 'prop-types';

const entity = new schema.Entity('identityNotifications', {});
const collection = [entity];

const IdentityNotificationsSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.number.isRequired,
    type: PropTypes.string,
    details: PropTypes.object,
    createdAt: PropTypes.string,
    acknowledgedAt: PropTypes.string,
  },
};

export default IdentityNotificationsSchema;
