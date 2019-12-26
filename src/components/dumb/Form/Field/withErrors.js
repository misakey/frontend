import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';

const withErrors = (Component) => {
  const Field = (props) => {
    const { field, form: { touched, errors, status }, prefix } = props;
    const { name } = field;

    const validationError = touched[name] && errors[name];
    const statusError = !touched[name] && (!isNil(status) ? status[name] : null);
    const displayError = !isEmpty(validationError) || !isEmpty(statusError);
    const error = validationError || statusError;
    const errorKeys = [
      `fields:${prefix}${name}.error.${error}`,
      `fields:${name}.error.${error}`,
      `fields:default.error.${error}`,
      'fields:default.error.unknown',
    ];

    return <Component {...props} displayError={displayError} errorKeys={errorKeys} />;
  };

  Field.propTypes = {
    field: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }).isRequired,
    prefix: PropTypes.string,
    form: PropTypes.shape({
      errors: PropTypes.objectOf(PropTypes.any),
      touched: PropTypes.objectOf(PropTypes.any),
      status: PropTypes.objectOf(PropTypes.any),
    }).isRequired,
  };

  Field.defaultProps = {
    prefix: '',
  };


  return Field;
};

export default withErrors;
