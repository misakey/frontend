import { schema } from 'normalizr';
import PropTypes from 'prop-types';

const entity = new schema.Entity('eventSenders', {}, {
  idAttribute: ({ id }) => id,
});

const collection = [entity];

const SenderSchema = {
  entity,
  collection,
  propTypes: {
    displayName: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string,
    id: PropTypes.string.isRequired,
    identifierValue: PropTypes.string.isRequired,
    identifierKind: PropTypes.string.isRequired,
  },
};

export default SenderSchema;
