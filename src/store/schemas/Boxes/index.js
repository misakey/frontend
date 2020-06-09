import { schema } from 'normalizr';
import PropTypes from 'prop-types';

import STATUSES from 'constants/app/boxes/statuses';
import EventSchema from 'store/schemas/Boxes/Events';

const entity = new schema.Entity('boxes', { events: EventSchema.collection });

const collection = [entity];

const BoxesSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string.isRequired,
    ownerId: PropTypes.string,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
    status: PropTypes.oneOf(STATUSES),
    // eslint-disable-next-line react/forbid-foreign-prop-types
    events: PropTypes.arrayOf(PropTypes.shape(EventSchema.propTypes)),
  },
};

export default BoxesSchema;
