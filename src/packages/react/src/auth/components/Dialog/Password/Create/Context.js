import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';

import PropTypes from 'prop-types';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import DialogCreatePassword from '.';

// CONTEXT
export const SetPasswordContext = createContext({
  onOpenSetPasswordDialog: null,
  onCloseSetPasswordDialog: null,
  withPasswordOnClick: null,
});

// HOOKS
export const useSetPasswordContext = () => useContext(SetPasswordContext);

// COMPONENTS
const SetPasswordContextProvider = ({ children }) => {
  const [isDialogOpened, setIsDialogOpened] = useState();
  const hasCrypto = useSelector(authSelectors.hasCrypto);

  const onOpenSetPasswordDialog = useCallback(
    () => setIsDialogOpened(true),
    [],
  );

  const onCloseSetPasswordDialog = useCallback(
    () => setIsDialogOpened(false),
    [],
  );

  const withOnClick = useCallback(
    (onClick) => (hasCrypto ? onClick : onOpenSetPasswordDialog),
    [hasCrypto, onOpenSetPasswordDialog],
  );

  const contextValue = useMemo(
    () => ({
      onOpenSetPasswordDialog,
      onCloseSetPasswordDialog,
      withPasswordOnClick: withOnClick,
    }),
    [onCloseSetPasswordDialog, onOpenSetPasswordDialog, withOnClick],
  );

  return (
    <SetPasswordContext.Provider value={contextValue}>
      <DialogCreatePassword open={isDialogOpened} onClose={onCloseSetPasswordDialog} />
      {children}
    </SetPasswordContext.Provider>
  );
};

SetPasswordContextProvider.propTypes = {
  children: PropTypes.node,
};

SetPasswordContextProvider.defaultProps = {
  children: null,
};

export default SetPasswordContextProvider;
