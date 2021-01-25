import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

import PropTypes from 'prop-types';

import InputBoxesUpload from 'components/smart/Input/Boxes/Upload';

// CONTEXT
export const BoxesUploadContext = createContext({
  open: false,
  onOpen: null,
  onClose: null,
});

// HOOKS
export const useBoxesUploadContext = () => useContext(BoxesUploadContext);

const InputBoxesUploadContext = ({ children, ...props }) => {
  const [open, setOpen] = useState(false);

  const onOpen = useCallback(
    () => setOpen(true),
    [setOpen],
  );

  const onClose = useCallback(
    () => setOpen(false),
    [setOpen],
  );

  const contextValue = useMemo(
    () => ({
      open,
      onOpen,
      onClose,
    }),
    [open, onOpen, onClose],
  );

  return (
    <InputBoxesUpload open={open} onOpen={onOpen} onClose={onClose} onUpload={onOpen} {...props}>
      <BoxesUploadContext.Provider value={contextValue}>
        {children}
      </BoxesUploadContext.Provider>
    </InputBoxesUpload>
  );
};

InputBoxesUploadContext.propTypes = {
  children: PropTypes.node,
};

InputBoxesUploadContext.defaultProps = {
  children: null,
};

export default InputBoxesUploadContext;
