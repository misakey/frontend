import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

import PropTypes from 'prop-types';

// CONTEXT
export const UploadContext = createContext({
  open: false,
  onOpen: null,
  onClose: null,
});

// HOOKS
export const useUploadContext = () => useContext(UploadContext);

const InputUploadContext = ({ children, component: Component, ...props }) => {
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
    <Component open={open} onOpen={onOpen} onClose={onClose} onUpload={onOpen} {...props}>
      <UploadContext.Provider value={contextValue}>
        {children}
      </UploadContext.Provider>
    </Component>
  );
};

InputUploadContext.propTypes = {
  component: PropTypes.elementType.isRequired,
  children: PropTypes.node,
};

InputUploadContext.defaultProps = {
  children: null,
};

export default InputUploadContext;
