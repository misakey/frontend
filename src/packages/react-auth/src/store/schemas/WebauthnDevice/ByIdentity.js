import { schema } from 'normalizr';
import PropTypes from 'prop-types';
import WebauthnDeviceSchema from '@misakey/react-auth/store/schemas/WebauthnDevice';

const entity = new schema.Entity('identityWebauthnDevices', {
  devices: WebauthnDeviceSchema.collection,
});

const collection = [entity];

const IdentityWebauthnDeviceSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-foreign-prop-types
    devices: PropTypes.shape(WebauthnDeviceSchema.propTypes),
  },
};

export default IdentityWebauthnDeviceSchema;
