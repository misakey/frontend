import { schema } from 'normalizr';
import PropTypes from 'prop-types';
import SenderSchema from 'store/schemas/Boxes/Sender';

const entity = new schema.Entity('events', {
  sender: SenderSchema.entity,
}, {});

const collection = [entity];

const EventSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    serverEventCreatedAt: PropTypes.string.isRequired,
    content: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-foreign-prop-types
    sender: SenderSchema.propTypes,
  },
};

export default EventSchema;
