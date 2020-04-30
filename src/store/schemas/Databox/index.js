import { schema } from 'normalizr';
import PropTypes from 'prop-types';

import DATABOX_STATUSES, { DRAFT } from 'constants/databox/status';
import isNil from '@misakey/helpers/isNil';
import has from '@misakey/helpers/has';
import ApplicationByIdSchema from 'store/schemas/Application/ById';
import ActivityLogsSchema from 'store/schemas/Databox/ActivityLogs';

const entity = new schema.Entity('databoxes', {
  producer: ApplicationByIdSchema.entity,
  logs: ActivityLogsSchema.collection,
}, {
  processStrategy: (item) => {
    const { producer, producerId } = item;
    const newItem = (isNil(producer) && !isNil(producerId))
      ? { ...item, producer: { id: producerId } }
      : item;

    // handle case sentAt is null and provided by API
    if (has(newItem, 'sentAt')) {
      const { status, sentAt, createdAt } = newItem;
      if (isNil(sentAt) && status !== DRAFT && !isNil(createdAt)) {
        return {
          ...newItem,
          sentAt: newItem.createdAt,
        };
      }
    }
    return newItem;
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
    // eslint-disable-next-line react/forbid-foreign-prop-types
    producer: PropTypes.shape(ApplicationByIdSchema.propTypes),
    createdAt: PropTypes.string.isRequired,
    updatedAt: PropTypes.string.isRequired,
    sentAt: PropTypes.string,
    status: PropTypes.oneOf(DATABOX_STATUSES),
    dpoComment: PropTypes.string,
    ownerComment: PropTypes.string,
    // eslint-disable-next-line react/forbid-foreign-prop-types
    logs: PropTypes.arrayOf(PropTypes.shape(ActivityLogsSchema.propTypes)),
  },
};

export default DataboxSchema;
