import { schema } from 'normalizr';
import PropTypes from 'prop-types';

import DATABOX_STATUSES, { DRAFT } from 'constants/databox/status';
import isNil from '@misakey/helpers/isNil';
import has from '@misakey/helpers/has';

const entity = new schema.Entity('databoxes', {}, {
  processStrategy: (item) => {
    if (has(item, 'sentAt') && isNil(item.sentAt) && item.status !== DRAFT && !isNil(item.createdAt)) {
      return {
        ...item,
        sentAt: item.createdAt,
      };
    }
    return item;
  },
});

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
