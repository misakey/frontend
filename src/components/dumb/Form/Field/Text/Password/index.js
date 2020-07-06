import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import FieldTextStandard from 'components/dumb/Form/Field/Text/Standard';

// CONSTANTS
const DEFAULT_INPUT_PROPS = {
  'data-matomo-ignore': true,
};

// COMPONENTS
const FieldTextPassword = ({ type, inputProps, ...props }) => {
  const mergedInputProps = useMemo(
    () => ({
      ...inputProps,
      ...DEFAULT_INPUT_PROPS,
    }),
    [inputProps],
  );

  return (
    <FieldTextStandard {...props} type={type} inputProps={mergedInputProps} />
  );
};

FieldTextPassword.propTypes = {
  type: PropTypes.string,
  inputProps: PropTypes.object,
};

FieldTextPassword.defaultProps = {
  type: 'password',
  inputProps: {},
};

export default FieldTextPassword;
