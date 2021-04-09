import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';

import { Field } from 'formik';

const FormField = ({ name, prefix, suffix, t, ...props }) => (
  <Field
    name={name}
    prefix={prefix}
    suffix={suffix}
    label={t([`fields:${prefix}${name}${suffix}.label`, `fields:${name}.label`], '')}
    placeholder={t([`fields:${prefix}${name}${suffix}.placeholder`, `fields:${name}.placeholder`], '')}
    helperText={t([`fields:${prefix}${name}${suffix}.helperText`, `fields:${name}.helperText`], '')}
    {...omitTranslationProps(props)}
  />
);

FormField.propTypes = {
  name: PropTypes.string.isRequired,
  prefix: PropTypes.string,
  suffix: PropTypes.string,
  t: PropTypes.func.isRequired,
};

FormField.defaultProps = {
  prefix: '',
  suffix: '',
};

export default withTranslation(['fields'])(FormField);
