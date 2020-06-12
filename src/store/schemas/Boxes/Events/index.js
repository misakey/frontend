import { schema } from 'normalizr';
import PropTypes from 'prop-types';

const entity = new schema.Entity('events', {}, {});

const collection = [entity];

const EventSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    serverEventCreatedAt: PropTypes.string.isRequired,
    content: PropTypes.object.isRequired,
    sender: PropTypes.shape({
      displayName: PropTypes.string,
      avatarUri: PropTypes.string,
    }),
  },
};

export default EventSchema;
