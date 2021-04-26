import React, { createContext, useContext, useMemo, useCallback } from 'react';

import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { selectors as ssoSelectors } from '@misakey/react/auth/store/reducers/sso';
import { UserManagerContext } from '@misakey/react/auth/components/OidcProvider/Context';

const { cbHintsKey: cbHintsKeySelector } = ssoSelectors;

// CONTEXT
export const AuthCallbackHintsContext = createContext({
  getCallbackHints: null,
  updateCallbackHints: null,
});

// HOOKS
export const useAuthCallbackHintsContext = () => useContext(AuthCallbackHintsContext);

// COMPONENTS
const AuthCallbackHintsContextProvider = ({ children }) => {
  const cbHintsKey = useSelector(cbHintsKeySelector);

  const { userManager } = useContext(UserManagerContext);

  const getCallbackHints = useCallback(
    () => userManager.getCallbackHints(cbHintsKey),
    [cbHintsKey, userManager],
  );

  const updateCallbackHints = useCallback(
    (values) => {
      const hints = userManager.getCallbackHints(cbHintsKey);
      return userManager.storeCallbackHints(cbHintsKey, { ...hints, ...values });
    },
    [cbHintsKey, userManager],
  );

  const contextValue = useMemo(
    () => ({
      getCallbackHints,
      updateCallbackHints,
    }),
    [getCallbackHints, updateCallbackHints],
  );

  return (
    <AuthCallbackHintsContext.Provider value={contextValue}>
      {children}
    </AuthCallbackHintsContext.Provider>
  );
};

AuthCallbackHintsContextProvider.propTypes = {
  children: PropTypes.node,
};

AuthCallbackHintsContextProvider.defaultProps = {
  children: null,
};

export default AuthCallbackHintsContextProvider;
