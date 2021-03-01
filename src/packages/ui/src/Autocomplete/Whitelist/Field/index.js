import React, { useMemo, useCallback } from 'react';

import PropTypes from 'prop-types';

import head from '@misakey/helpers/head';
import compact from '@misakey/helpers/compact';
import prop from '@misakey/helpers/prop';
import findIndex from '@misakey/helpers/findIndex';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import isArray from '@misakey/helpers/isArray';
import differenceBy from '@misakey/helpers/differenceBy';

import { useTranslation } from 'react-i18next';
import useFieldErrors from '@misakey/hooks/useFieldErrors';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useFieldTranslations from '@misakey/hooks/useFieldTranslations';

import AutocompleteWhitelist from '@misakey/ui/Autocomplete/Whitelist';

// HELPERS
const getRemovedIndex = (prev, next) => head(differenceBy(prev || [], next || [], 'identifierValue'));

const identifierValueProp = prop('identifierValue');
const getFirstError = (errorKeys) => {
  if (isEmpty(errorKeys)) {
    return undefined;
  }
  if (isArray(errorKeys)) {
    const compactErrorKeys = compact(errorKeys);
    if (isEmpty(compactErrorKeys)) {
      return undefined;
    }
    const firstError = head(compactErrorKeys);
    if (isArray(firstError)) {
      return firstError;
    }
    return compactErrorKeys;
  }
  return errorKeys;
};

// COMPONENTS
const FormFieldAutocompleteWhitelistWithErrors = ({
  name, prefix, multiple, textFieldProps, ...props
}) => {
  const { t } = useTranslation('fields');
  const { helperText, ...textFieldTranslations } = useFieldTranslations({ name, prefix });

  const fieldConfig = useMemo(
    () => ({ name, prefix, multiple, parseError: identifierValueProp }),
    [name, prefix, multiple],
  );

  const {
    field,
    meta: { error },
    helpers: { setValue, setTouched, setError },
    errorKeys,
    displayError,
  } = useFieldErrors(fieldConfig);

  const { value: fieldValue } = useSafeDestr(field);

  const helperTextOrErrorText = useMemo(
    () => (displayError
      ? t(getFirstError(errorKeys))
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

  const errorIndexes = useMemo(
    () => (isNil(error)
      ? []
      : Object.entries(error)
        .reduce((aggr, [key, value]) => {
          if (isNil(value)) {
            return aggr;
          }
          return [...aggr, Number(key)];
        }, [])),
    [error],
  );

  const onChange = useCallback(
    (event, value) => {
      const removedIdentifierValue = identifierValueProp(getRemovedIndex(fieldValue, value));
      const removedIndex = findIndex(fieldValue, ['identifierValue', removedIdentifierValue]);
      if (removedIndex !== -1 && !isNil(error)) {
        const nextError = error.reduce((aggr, err, index) => {
          if (index === removedIndex) {
            return aggr;
          }
          if (index > removedIndex) {
            aggr[index - 1] = err; // eslint-disable-line no-param-reassign
            return aggr;
          }
          return [...aggr, err];
        }, []);
        setError(nextError);
      }
      setValue(value);
      setTouched(true, false);
    },
    [fieldValue, error, setError, setValue, setTouched],
  );

  return (
    <AutocompleteWhitelist
      name={name}
      {...field}
      onChange={onChange}
      textFieldProps={fieldTextFieldProps}
      multiple
      errorIndexes={errorIndexes}
      {...props}
    />
  );
};

FormFieldAutocompleteWhitelistWithErrors.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  prefix: PropTypes.string,
  multiple: PropTypes.bool,
  textFieldProps: PropTypes.object,
};

FormFieldAutocompleteWhitelistWithErrors.defaultProps = {
  className: '',
  prefix: '',
  multiple: false,
  textFieldProps: {},
};

export default FormFieldAutocompleteWhitelistWithErrors;
