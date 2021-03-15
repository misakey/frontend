import { schema } from 'normalizr';
import PropTypes from 'prop-types';

import BoxesSchema from 'store/schemas/Boxes';
import DatatagsSchema from 'store/schemas/Datatags';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';

const entity = new schema.Entity('boxesByDatatag', {
  boxes: BoxesSchema.collection,
  datatag: DatatagsSchema.entity,
}, {
  idAttribute: ({ datatag, datatagId, organizationId }) => {
    if (isEmpty(datatagId) && isNil(datatag)) {
      return organizationId;
    }
    return isNil(datatag) ? datatagId : datatag.id;
  },
});

const collection = [entity];

const BoxesByDatatagSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string.isRequired,
    organizationId: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-foreign-prop-types
    boxes: PropTypes.arrayOf(PropTypes.shape(BoxesSchema.propTypes)),
    // eslint-disable-next-line react/forbid-foreign-prop-types
    datatagId: DatatagsSchema.propTypes.id,
    // eslint-disable-next-line react/forbid-foreign-prop-types
    datatag: PropTypes.shape(DatatagsSchema.propTypes),
  },
};

export default BoxesByDatatagSchema;
