import React, { createContext, useContext } from 'react';

import DialogConfirmContextProvider from '@misakey/ui/Dialog/Confirm/Context';
import DialogBoxesDelete from 'components/smart/Dialog/Boxes/Delete';

// CONTEXT
export const DialogBoxesDeleteContext = createContext({
  onOpen: null,
  onClose: null,
});

// HOOKS
export const useDialogBoxesDeleteContext = () => useContext(DialogBoxesDeleteContext);

// COMPONENTS
const DialogBoxesDeleteContextProvider = (props) => (
  <DialogConfirmContextProvider
    {...props}
    component={DialogBoxesDelete}
    provider={DialogBoxesDeleteContext.Provider}
  />
);

export default DialogBoxesDeleteContextProvider;
