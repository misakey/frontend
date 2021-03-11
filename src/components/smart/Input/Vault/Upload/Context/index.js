import React from 'react';

import PropTypes from 'prop-types';

import InputUploadContext from '@misakey/ui/Input/Upload/Context';
import InputVaultUpload from 'components/smart/Input/Vault/Upload';

// COMPONENTS
const InputVaultUploadContext = ({ children, ...props }) => (
  <InputUploadContext component={InputVaultUpload} {...props}>
    {children}
  </InputUploadContext>
);

InputVaultUploadContext.propTypes = {
  children: PropTypes.node,
};

InputVaultUploadContext.defaultProps = {
  children: null,
};

export default InputVaultUploadContext;
