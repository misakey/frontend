import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';

import PropTypes from 'prop-types';

import DialogConfirm, { PROP_TYPES as DIALOG_CONFIRM_PROP_TYPES } from '@misakey/ui/Dialog/Confirm';

// CONTEXT
export const DialogConfirmContext = createContext({
  onOpen: null,
  onClose: null,
});

// HOOKS
export const useDialogConfirmContext = () => useContext(DialogConfirmContext);

// COMPONENTS
const DialogConfirmContextProvider = ({
  provider: Provider, component: Component,
  children, ...rest
}) => {
  const [open, setOpen] = useState();

  const onOpen = useCallback(
    () => setOpen(true),
    [],
  );

  const onClose = useCallback(
    () => setOpen(false),
    [],
  );

  const contextValue = useMemo(
    () => ({
      onOpen,
      onClose,
    }),
    [onClose, onOpen],
  );

  return (
    <Provider value={contextValue}>
      <Component open={open} onClose={onClose} {...rest} />
      {children}
    </Provider>
  );
};

DialogConfirmContextProvider.propTypes = {
  children: PropTypes.node,
  provider: PropTypes.elementType,
  component: PropTypes.elementType,
  ...DIALOG_CONFIRM_PROP_TYPES,
};

DialogConfirmContextProvider.defaultProps = {
  children: null,
  provider: DialogConfirmContext.Provider,
  component: DialogConfirm,
};

export default DialogConfirmContextProvider;
