import { schema } from 'normalizr';
import PropTypes from 'prop-types';
import DatatagsSchema from 'store/schemas/Datatags';

import isNil from '@misakey/core/helpers/isNil';

const entity = new schema.Entity('organizationDatatags', {
  datatags: DatatagsSchema.collection,
}, {
  idAttribute: ({ id }) => {
    if (isNil(id)) {
      return window.env.SELF_CLIENT_ID;
    }
    return id;
  },
});

const collection = [entity];

const OrganizationDatatagsSchema = {
  entity,
  collection,
  propTypes: {
    id: PropTypes.string.isRequired,
    identityId: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-foreign-prop-types
    datatags: PropTypes.shape(DatatagsSchema.propTypes),
  },
};

export default OrganizationDatatagsSchema;
