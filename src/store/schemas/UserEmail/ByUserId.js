import { schema } from 'normalizr';
import PropTypes from 'prop-types';
import UserEmailSchema from 'store/schemas/UserEmail';

const entity = new schema.Entity('userEmailsByUserId', { userEmails: UserEmailSchema.collection }, {
  idAttribute: 'userId',
});
const collection = [entity];

const UserEmailByUserIdSchema = {
  entity,
  collection,
  propTypes: {
    // eslint-disable-next-line react/forbid-foreign-prop-types
    userId: UserEmailSchema.propTypes.userId.isRequired,
    // eslint-disable-next-line react/forbid-foreign-prop-types
    userEmails: PropTypes.arrayOf(PropTypes.shape(UserEmailSchema.propTypes)),
  },
};

export default UserEmailByUserIdSchema;
