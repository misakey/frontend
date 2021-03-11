import React from 'react';

import PropTypes from 'prop-types';

import InputUploadContext from '@misakey/ui/Input/Upload/Context';
import InputBoxesUpload from 'components/smart/Input/Boxes/Upload';

// COMPONENTS
const InputBoxesUploadContext = ({ children, ...props }) => (
  <InputUploadContext component={InputBoxesUpload} {...props}>
    {children}
  </InputUploadContext>
);

InputBoxesUploadContext.propTypes = {
  children: PropTypes.node,
};

InputBoxesUploadContext.defaultProps = {
  children: null,
};

export default InputBoxesUploadContext;
