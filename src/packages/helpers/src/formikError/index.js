import isNil from '@misakey/helpers/isNil';
import isArray from '@misakey/helpers/isArray';

const getErrorKeys = (prefix, name, validationError) => [
  `fields:${prefix}${name}.error.${validationError}`,
  `fields:${name}.error.${validationError}`,
  `fields:default.error.${validationError}`,
  'fields:default.error.unknown',
];

export const getErrors = ({ field: { name }, form: { touched, errors, status }, prefix }) => {
  const validationError = touched[name] ? errors[name] : null;
  const statusError = !touched[name] || isNil(status) ? null : status[name];
  const displayError = !isNil(validationError) || !isNil(statusError);

  const error = validationError || statusError;
  const errorKeys = getErrorKeys(prefix, name, error);

  return { displayError, errorKeys };
};

export const getFieldError = ({ field: { name }, meta: { error, touched }, prefix }) => {
  const validationError = touched ? error : null;
  const displayError = !isNil(validationError);

  const errorKeys = getErrorKeys(prefix, name, validationError);

  return { displayError, errorKeys };
};


export const getArrayFieldError = ({ field: { name }, meta: { error, touched }, prefix }) => {
  const validationError = touched ? error : null;
  const displayError = !isNil(validationError);

  const errorKeys = isArray(validationError)
    ? validationError.map((err) => (isNil(err) ? undefined : getErrorKeys(prefix, name, err)))
    : getErrorKeys(prefix, name, validationError);

  return { displayError, errorKeys };
};
