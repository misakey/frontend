import { schema } from 'normalizr';
import PropTypes from 'prop-types';

const entity = new schema.Entity('eventSenders', {}, {
  idAttribute: (value) => value.identifier.value,
});

const collection = [entity];

const SenderSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string.isRequired,
    displayName: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string,
    identifier: PropTypes.shape({
      value: PropTypes.string.isRequired,
      kind: PropTypes.string,
    }),
  },
};

export default SenderSchema;
