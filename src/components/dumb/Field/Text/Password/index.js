import React from 'react';
import PropTypes from 'prop-types';
import FieldText from 'components/dumb/Field/Text';

// COMPONENTS
// @FIXME: update @misakey/ui component
const FieldTextPassword = ({ type, ...props }) => <FieldText {...props} type={type} />;

FieldTextPassword.propTypes = {
  type: PropTypes.string,
};

FieldTextPassword.defaultProps = {
  type: 'password',
};

export default FieldTextPassword;
