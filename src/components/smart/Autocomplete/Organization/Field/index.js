import React, { useMemo, useCallback } from 'react';

import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';
import useFieldErrors from '@misakey/hooks/useFieldErrors';
import useFieldTranslations from '@misakey/hooks/useFieldTranslations';

import AutocompleteOrganization from 'components/smart/Autocomplete/Organization';

// COMPONENTS
// @FIXME could be merged with src/packages/ui/src/Autocomplete/Whitelist/Field
const FormFieldAutocompleteOrganizationWithErrors = ({
  name, prefix, multiple, textFieldProps, ...props
}) => {
  const { t } = useTranslation('fields');
  const { helperText, ...textFieldTranslations } = useFieldTranslations({ name, prefix });

  const fieldConfig = useMemo(
    () => ({ name, prefix, multiple }),
    [name, prefix, multiple],
  );

  const {
    field,
    helpers: { setValue, setTouched },
    errorKeys,
    displayError,
  } = useFieldErrors(fieldConfig);

  const helperTextOrErrorText = useMemo(
    () => (displayError
      ? t(errorKeys)
      : helperText),
    [displayError, t, errorKeys, helperText],
  );

  const fieldTextFieldProps = useMemo(
    () => ({
      ...textFieldTranslations,
      error: displayError,
      helperText: helperTextOrErrorText,
      ...textFieldProps,
    }),
    [displayError, helperTextOrErrorText, textFieldProps, textFieldTranslations],
  );

  const onChange = useCallback(
    (event, value) => {
      setValue(value);
      setTouched(true, false);
    },
    [setValue, setTouched],
  );

  return (
    <AutocompleteOrganization
      name={name}
      {...field}
      onChange={onChange}
      textFieldProps={fieldTextFieldProps}
      {...props}
    />
  );
};

FormFieldAutocompleteOrganizationWithErrors.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  prefix: PropTypes.string,
  multiple: PropTypes.bool,
  textFieldProps: PropTypes.object,
};

FormFieldAutocompleteOrganizationWithErrors.defaultProps = {
  className: '',
  prefix: '',
  multiple: false,
  textFieldProps: {},
};

export default FormFieldAutocompleteOrganizationWithErrors;
