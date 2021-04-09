import React, { forwardRef, useMemo } from 'react';

import PropTypes from 'prop-types';

import { getErrors } from '@misakey/core/helpers/formikError';

// COMPONENTS
// NB: withErrors expects to be wrapped by a Formik#Field component
const withErrors = (Component, { parseError } = {}) => {
  const Field = forwardRef((props, ref) => {
    const { displayError, errorKeys } = useMemo(() => getErrors(props, parseError), [props]);

    return <Component ref={ref} displayError={displayError} errorKeys={errorKeys} {...props} />;
  });

  Field.propTypes = {
    field: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }).isRequired,
    prefix: PropTypes.string,
    suffix: PropTypes.string,
    form: PropTypes.shape({
      errors: PropTypes.objectOf(PropTypes.any),
      touched: PropTypes.objectOf(PropTypes.any),
      status: PropTypes.objectOf(PropTypes.any),
    }).isRequired,
  };

  Field.defaultProps = {
    prefix: '',
    suffix: '',
  };


  return Field;
};

export default withErrors;
