import React from 'react';
import PropTypes from 'prop-types';

import map from '@misakey/helpers/map';

import FormField from '@misakey/ui/Form/Field';

// @UNUSED
// COMPONENTS
const FormFields = ({
  defaultFields, fields, prefix,
}) => map(fields, (props, name) => (
  <FormField
    key={`${prefix}${name}`}
    name={name}
    prefix={prefix}
    {...defaultFields[name]}
    {...props}
  />
));

FormFields.propTypes = {
  defaultFields: PropTypes.objectOf(PropTypes.object),
  fields: PropTypes.objectOf(PropTypes.object),
  prefix: PropTypes.string,
};

FormFields.defaultProps = {
  defaultFields: {},
  fields: {},
  prefix: '',
};

export default FormFields;

export const FIELD_PROPTYPES = PropTypes.shape({
  component: PropTypes.function,
  helperText: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
});
