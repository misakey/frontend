import { useCallback } from 'react';
import PropTypes from 'prop-types';

import { EMAIL_DOMAIN } from '@misakey/ui/constants/accessTypes';

import path from '@misakey/helpers/path';
import head from '@misakey/helpers/head';
import compact from '@misakey/helpers/compact';
import prop from '@misakey/helpers/prop';
import isString from '@misakey/helpers/isString';
import isNil from '@misakey/helpers/isNil';

import useWithErrorsMapper from '@misakey/hooks/useWithErrorsMapper';

import AutocompleteWhitelist from '@misakey/ui/Autocomplete/Whitelist';
import withErrors from '@misakey/ui/Form/Field/withErrors';

// HELPERS
const identifierValuePath = path(['identifier', 'value']);
const typeProp = prop('type');

const parseError = (error, value) => {
  if (isNil(error)) {
    return undefined;
  }
  if (isString(error)) {
    return error;
  }
  const firstErrorKey = head(Object.keys(error));
  const type = typeProp(value[firstErrorKey]);
  const errorItem = head(compact(error));
  const errorOrSuberror = isString(errorItem) ? errorItem : identifierValuePath(errorItem);
  return type === EMAIL_DOMAIN ? `${EMAIL_DOMAIN}.${errorOrSuberror}` : errorOrSuberror;
};

// COMPONENTS
const FormFieldAutocompleteWhitelistWithErrors = ({
  form: { setFieldValue, setFieldTouched },
  ...props
}) => {
  const { error, helperText, label, name, ...fieldProps } = useWithErrorsMapper(props);

  const onChange = useCallback(
    (event, value) => {
      setFieldValue(name, value);
      setFieldTouched(name, true, false);
    },
    [name, setFieldValue, setFieldTouched],
  );

  return (
    <AutocompleteWhitelist
      name={name}
      {...fieldProps}
      onChange={onChange}
      textFieldProps={{ error, helperText, label }}
    />
  );
};

FormFieldAutocompleteWhitelistWithErrors.propTypes = {
  className: PropTypes.string,
  displayError: PropTypes.bool.isRequired,
  errorKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  form: PropTypes.shape({
    setFieldTouched: PropTypes.func.isRequired,
    setFieldValue: PropTypes.func.isRequired,
  }).isRequired,
  field: PropTypes.shape({ name: PropTypes.string.isRequired }).isRequired,
  helperText: PropTypes.string,
};

FormFieldAutocompleteWhitelistWithErrors.defaultProps = {
  className: '',
  helperText: '',
};

export default withErrors(FormFieldAutocompleteWhitelistWithErrors, { parseError });
