import isNil from '@misakey/core/helpers/isNil';
import isFunction from '@misakey/core/helpers/isFunction';
import isArray from '@misakey/core/helpers/isArray';

const getErrorKeys = (prefix, name, validationError) => [
  `fields:${prefix}${name}.error.${validationError}`,
  `fields:${name}.error.${validationError}`,
  `fields:default.error.${validationError}`,
  'fields:default.error.unknown',
];

export const getErrors = (
  { field: { name, value }, form: { touched, errors, status }, prefix },
  parseError,
) => {
  const validationError = touched[name] ? errors[name] : null;
  const statusError = !touched[name] || isNil(status) ? null : status[name];
  const displayError = !isNil(validationError) || !isNil(statusError);

  const error = validationError || statusError;
  const errorKeys = getErrorKeys(
    prefix,
    name,
    isFunction(parseError) ? parseError(error, value) : error,
  );

  return { displayError, errorKeys };
};

export const getFieldError = (
  { field: { name }, meta: { error, touched }, prefix },
  parseError = null,
) => {
  const validationError = touched ? error : null;
  const displayError = !isNil(validationError);

  const errorKey = isFunction(parseError) ? parseError(validationError) : validationError;
  const errorKeys = getErrorKeys(prefix, name, errorKey);

  return { displayError, errorKeys };
};


export const getArrayFieldError = (
  { field: { name }, meta: { error, touched }, prefix },
  parseError = null,
) => {
  const validationError = touched ? error : null;
  const displayError = !isNil(validationError);

  if (isArray(validationError)) {
    const errorKeys = validationError
      .map((err) => {
        if (isNil(err)) {
          return undefined;
        }
        return isFunction(parseError)
          ? getErrorKeys(prefix, name, parseError(err))
          : getErrorKeys(prefix, name, err);
      });
    return { displayError, errorKeys };
  }

  const errorKey = isFunction(parseError) ? parseError(validationError) : validationError;

  const errorKeys = isArray(validationError)
    ? validationError.map((err) => (isNil(err) ? undefined : getErrorKeys(prefix, name, err)))
    : getErrorKeys(prefix, name, errorKey);

  return { displayError, errorKeys };
};
