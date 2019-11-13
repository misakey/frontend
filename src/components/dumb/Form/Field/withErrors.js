import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from '@misakey/helpers/isEmpty';

const withErrors = (Component) => {
  const Field = (props) => {
    const { field, form: { touched, errors } } = props;
    const { name, prefix } = field;

    const error = errors[name];
    const displayError = !!(touched[name] && !isEmpty(error));
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
      prefix: PropTypes.string,
    }).isRequired,
    form: PropTypes.shape({
      errors: PropTypes.objectOf(PropTypes.any),
      touched: PropTypes.objectOf(PropTypes.any),
    }).isRequired,
  };


  return Field;
};

export default withErrors;
