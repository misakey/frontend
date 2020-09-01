import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

import { getErrors } from '@misakey/helpers/formikError';

// COMPONENTS
// NB: withErrors expects to be wrapped by a Formik#Field component
const withErrors = (Component) => {
  const Field = forwardRef((props, ref) => {
    const { displayError, errorKeys } = getErrors(props);

    return <Component ref={ref} displayError={displayError} errorKeys={errorKeys} {...props} />;
  });

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
