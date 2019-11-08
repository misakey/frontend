import React from 'react';
import PropTypes from 'prop-types';

import FieldText from '../index';

// COMPONENTS
const FieldTextPassword = ({ type, ...props }) => (
  <FieldText {...props} type={type} inputProps={{ 'data-matomo-ignore': true }} />
);

FieldTextPassword.propTypes = {
  type: PropTypes.string,
};

FieldTextPassword.defaultProps = {
  type: 'password',
};

export default FieldTextPassword;
