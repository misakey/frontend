import { schema } from 'normalizr';
import PropTypes from 'prop-types';

const entity = new schema.Entity('webauthnDevices', {});
const collection = [entity];

const WebauthnDeviceSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string.isRequired,
    identityId: PropTypes.string.isRequired,
    name: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
  },
};

export default WebauthnDeviceSchema;
