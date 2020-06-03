import { schema } from 'normalizr';
import PropTypes from 'prop-types';

const entity = new schema.Entity('events', {}, {});

const collection = [entity];

const EventSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    serverTimestamp: PropTypes.string.isRequired,
    content: PropTypes.object.isRequired,
    createdAt: PropTypes.string.isRequired,
    sender: PropTypes.shape({
      displayName: PropTypes.string,
      avatarUri: PropTypes.string,
    }),
  },
};

export default EventSchema;
