import PropTypes from 'prop-types';

import DatatagsSchema from '@misakey/react/auth/store/schemas/Datatags';
import OrganizationsSchema from '@misakey/react/auth/store/schemas/Organizations';

export const PROP_TYPES = {
  scope: PropTypes.string,
  type: PropTypes.string,
  details: PropTypes.shape({
    // eslint-disable-next-line react/forbid-foreign-prop-types
    datatag: PropTypes.shape(DatatagsSchema.propTypes),
    // eslint-disable-next-line react/forbid-foreign-prop-types
    organization: PropTypes.shape(OrganizationsSchema.propTypes),
    boxIds: PropTypes.arrayOf(PropTypes.string),
  }),
  alreadyConsented: PropTypes.bool,
};
