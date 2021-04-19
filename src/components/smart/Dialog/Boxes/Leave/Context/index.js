import React, { createContext, useContext } from 'react';

import DialogConfirmContextProvider from '@misakey/ui/Dialog/Confirm/Context';
import DialogBoxesLeave from 'components/smart/Dialog/Boxes/Leave';

// CONTEXT
export const DialogBoxesLeaveContext = createContext({
  onOpen: null,
  onClose: null,
});

// HOOKS
export const useDialogBoxesLeaveContext = () => useContext(DialogBoxesLeaveContext);

// COMPONENTS
const DialogBoxesLeaveContextProvider = (props) => (
  <DialogConfirmContextProvider
    {...props}
    component={DialogBoxesLeave}
    provider={DialogBoxesLeaveContext.Provider}
  />
);

export default DialogBoxesLeaveContextProvider;
