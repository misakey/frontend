import { schema } from 'normalizr';
import PropTypes from 'prop-types';

import { NOTIFICATIONS } from 'constants/notifications';

const entity = new schema.Entity('identities', {});
const collection = [entity];

const IdentitySchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string.isRequired,
    accountId: PropTypes.string,
    identifierId: PropTypes.string.isRequired,
    isAuthable: PropTypes.bool.isRequired,
    displayName: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string,
    notifications: PropTypes.oneOf(NOTIFICATIONS),
  },
};

export default IdentitySchema;
