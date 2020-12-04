import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import { Field } from 'formik';

const FormField = ({ name, prefix, t, ...props }) => (
  <Field
    name={name}
    prefix={prefix}
    label={t([`fields:${prefix}${name}.label`, `fields:${name}.label`], '')}
    placeholder={t([`fields:${prefix}${name}.placeholder`, `fields:${name}.placeholder`], '')}
    helperText={t([`fields:${prefix}${name}.helperText`, `fields:${name}.helperText`], '')}
    {...omitTranslationProps(props)}
  />
);

FormField.propTypes = {
  name: PropTypes.string.isRequired,
  prefix: PropTypes.string,
  t: PropTypes.func.isRequired,
};

FormField.defaultProps = {
  prefix: '',
};

export default withTranslation(['fields'])(FormField);
