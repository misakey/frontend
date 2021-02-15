import { schema } from 'normalizr';
import PropTypes from 'prop-types';
import SenderSchema from 'store/schemas/Boxes/Sender';
import { ALL_EVENT_TYPES } from '@misakey/ui/constants/boxes/events';
import DecryptedFileSchema from 'store/schemas/Files/Decrypted';

const entity = new schema.Entity('events', {
  sender: SenderSchema.entity,
  content: {
    decryptedFile: DecryptedFileSchema.entity,
  },

}, {});

const collection = [entity];

const EventSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(ALL_EVENT_TYPES).isRequired,
    serverEventCreatedAt: PropTypes.string.isRequired,
    content: PropTypes.object,
    referrerId: PropTypes.string,
    // eslint-disable-next-line react/forbid-foreign-prop-types
    sender: SenderSchema.propTypes.isRequired,
  },
};

export default EventSchema;
