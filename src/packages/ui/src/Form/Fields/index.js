import React from 'react';
import { Field } from 'formik';
import PropTypes from 'prop-types';
import map from '@misakey/helpers/map';
import { withTranslation } from 'react-i18next';

const FormFields = ({
  defaultFields, fields, prefix, t,
}) => map(fields, (props, name) => (
  <Field
    name={name}
    prefix={prefix}
    key={[`fields__new:${prefix}${name}`, `fields__new:${name}`]}
    label={t([`fields__new:${prefix}${name}.label`, `fields__new:${name}.label`])}
    placeholder={t([`fields__new:${prefix}${name}.placeholder`, `fields__new:${name}.placeholder`], '')}
    helperText={t([`fields__new:${prefix}${name}.helperText`, `fields__new:${name}.helperText`], '')}
    {...defaultFields[name]}
    {...props}
  />
));

FormFields.propTypes = {
  defaultFields: PropTypes.objectOf(PropTypes.object),
  fields: PropTypes.objectOf(PropTypes.object),
  prefix: PropTypes.string,
  t: PropTypes.func.isRequired,
};

FormFields.defaultProps = {
  defaultFields: {},
  fields: {},
  prefix: '',
};

export default withTranslation(['fields__new'])(FormFields);

export const FIELD_PROPTYPES = PropTypes.shape({
  component: PropTypes.function,
  helperText: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
});
