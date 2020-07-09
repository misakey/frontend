import isNil from '@misakey/helpers/isNil';

export const getErrors = ({ field: { name }, form: { touched, errors, status }, prefix }) => {
  const validationError = touched[name] ? errors[name] : null;
  const statusError = !touched[name] || isNil(status) ? null : status[name];
  const displayError = !isNil(validationError) || !isNil(statusError);

  const error = validationError || statusError;
  const errorKeys = [
    `fields:${prefix}${name}.error.${error}`,
    `fields:${name}.error.${error}`,
    `fields:default.error.${error}`,
    'fields:default.error.unknown',
  ];

  return { displayError, errorKeys };
};

export const getFieldError = ({ field: { name }, meta: { error, touched }, prefix }) => {
  const validationError = touched ? error : null;
  const displayError = !isNil(validationError);

  const errorKeys = [
    `fields:${prefix}${name}.error.${validationError}`,
    `fields:${name}.error.${validationError}`,
    `fields:default.error.${validationError}`,
    'fields:default.error.unknown',
  ];

  return { displayError, errorKeys };
};
