import { schema } from 'normalizr';
import PropTypes from 'prop-types';

import ACCESS_MODES from '@misakey/ui/constants/accessModes';

import EventSchema from 'store/schemas/Boxes/Events';
import UserSchema from '@misakey/react/auth/store/schemas/User';

const entity = new schema.Entity('boxes', {
  events: EventSchema.collection,
  accesses: EventSchema.collection,
  lastEvent: EventSchema.entity,
  creator: UserSchema.entity,
  subject: UserSchema.entity,
  members: UserSchema.collection,
});

const collection = [entity];

const BoxesSchema = {
  entity,
  collection,
  propTypes: {
    publicKey: PropTypes.string,
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    accessMode: PropTypes.oneOf(ACCESS_MODES),
    serverCreatedAt: PropTypes.string,
    settings: PropTypes.shape({
      muted: PropTypes.bool,
    }),
    eventsCount: PropTypes.number,
    // eslint-disable-next-line react/forbid-foreign-prop-types
    events: PropTypes.arrayOf(PropTypes.shape(EventSchema.propTypes)),
    // eslint-disable-next-line react/forbid-foreign-prop-types
    accesses: PropTypes.arrayOf(PropTypes.shape(EventSchema.propTypes)),
    // eslint-disable-next-line react/forbid-foreign-prop-types
    creator: PropTypes.shape(UserSchema.propTypes),
    // eslint-disable-next-line react/forbid-foreign-prop-types
    subject: PropTypes.shape(UserSchema.propTypes),
    // eslint-disable-next-line react/forbid-foreign-prop-types
    lastEvent: PropTypes.shape(EventSchema.propTypes),
    // eslint-disable-next-line react/forbid-foreign-prop-types
    members: PropTypes.arrayOf(PropTypes.shape(UserSchema.propTypes)),
  },
};

export default BoxesSchema;
