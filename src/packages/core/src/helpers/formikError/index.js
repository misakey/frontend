import isNil from '@misakey/core/helpers/isNil';
import isFunction from '@misakey/core/helpers/isFunction';
import isArray from '@misakey/core/helpers/isArray';

const getErrorKeys = (name, validationError, prefix, suffix) => [
  `fields:${prefix}${name}${suffix}.error.${validationError}`,
  `fields:${name}.error.${validationError}`,
  `fields:default.error.${validationError}`,
  'fields:default.error.unknown',
];

export const getErrors = (
  { field: { name, value }, form: { touched, errors, status }, prefix, suffix },
  parseError,
) => {
  const validationError = touched[name] ? errors[name] : null;
  const statusError = !touched[name] || isNil(status) ? null : status[name];
  const displayError = !isNil(validationError) || !isNil(statusError);

  const error = validationError || statusError;
  const errorKeys = getErrorKeys(
    name,
    isFunction(parseError) ? parseError(error, value) : error,
    prefix,
    suffix,
  );

  return { displayError, errorKeys };
};

export const getFieldError = (
  { field: { name }, meta: { error, touched }, prefix, suffix },
  parseError = null,
) => {
  const validationError = touched ? error : null;
  const displayError = !isNil(validationError);

  const errorKey = isFunction(parseError) ? parseError(validationError) : validationError;
  const errorKeys = getErrorKeys(name, errorKey, prefix, suffix);

  return { displayError, errorKeys };
};


export const getArrayFieldError = (
  { field: { name }, meta: { error, touched }, prefix, suffix },
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
          ? getErrorKeys(name, parseError(err), prefix, suffix)
          : getErrorKeys(name, err, prefix, suffix);
      });
    return { displayError, errorKeys };
  }

  const errorKey = isFunction(parseError) ? parseError(validationError) : validationError;

  const errorKeys = isArray(validationError)
    ? validationError.map(
      (err) => (isNil(err) ? undefined : getErrorKeys(name, err, prefix, suffix)),
    )
    : getErrorKeys(name, errorKey, prefix, suffix);

  return { displayError, errorKeys };
};
