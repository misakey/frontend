import { schema } from 'normalizr';
import PropTypes from 'prop-types';

import MAIL_PROVIDER_TYPES from 'constants/mail-providers/types';

const entity = new schema.Entity('userEmails', {});
const collection = [entity];

const UserEmailSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.number.isRequired,
    active: PropTypes.bool,
    email: PropTypes.string,
    userId: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
    type: PropTypes.oneOf(MAIL_PROVIDER_TYPES),
  },
};

export default UserEmailSchema;
