import { schema } from 'normalizr';
import PropTypes from 'prop-types';

import DATABOX_STATUSES from 'constants/databox/status';

const entity = new schema.Entity('databoxes', {});
const collection = [entity];

const DataboxSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string.isRequired,
    ownerId: PropTypes.string,
    producerId: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
    sentAt: PropTypes.string,
    status: PropTypes.oneOf(DATABOX_STATUSES),
    dpoComment: PropTypes.string,
    ownerComment: PropTypes.string,
  },
};

export default DataboxSchema;
