import { schema } from 'normalizr';
import PropTypes from 'prop-types';

const entity = new schema.Entity('ratings', {});
const collection = [entity];

const RatingSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    applicationId: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    comment: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
    user: PropTypes.shape({
      displayName: PropTypes.string,
      avatarUrl: PropTypes.string,
    }),
  },
};

export default RatingSchema;
