import React from 'react';
import PropTypes from 'prop-types';
import isNil from '@misakey/helpers/isNil';

const withErrors = (Component) => {
  const Field = (props) => {
    const { field, form: { touched, errors, status }, prefix } = props;
    const { name } = field;

    const validationError = touched[name] ? errors[name] : null;
    const statusError = !touched[name] || isNil(status) ? null : status[name];
    const displayError = !isNil(validationError) || !isNil(statusError);

    const error = validationError || statusError;
    const errorKeys = [
      `fields__new:${prefix}${name}.error.${error}`,
      `fields__new:${name}.error.${error}`,
      `fields__new:default.error.${error}`,
      'fields__new:default.error.unknown',
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
