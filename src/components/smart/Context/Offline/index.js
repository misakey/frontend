import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';

import PropTypes from 'prop-types';

import networkErrorMiddleware from 'middlewares/networkError';
import isFunction from '@misakey/helpers/isFunction';
// import simulateNetworkError from '@misakey/api/helpers/simulateNetworkError';

// CONTEXT
const OfflineContext = createContext({
  onNetworkError: null,
  onNetworkSuccess: null,
  offlineError: undefined,
});

// HOOKS
export const useOfflineContext = () => useContext(OfflineContext);

const OfflineContextProvider = ({ addMiddleware, children }) => {
  const [offlineError, setOfflineError] = useState();

  const onNetworkError = useCallback(
    (error) => {
      setOfflineError(error);
    },
    [setOfflineError],
  );

  const onNetworkSuccess = useCallback(
    () => {
      setOfflineError(undefined);
    },
    [setOfflineError],
  );

  useEffect(
    () => {
      if (isFunction(addMiddleware)) {
        addMiddleware(networkErrorMiddleware(onNetworkError, onNetworkSuccess));
      }
    },
    [addMiddleware, onNetworkError, onNetworkSuccess],
  );

  // NB: Easy test
  // useEffect(
  //   () => {
  //     simulateNetworkError();
  //   },
  //   [],
  // );

  const contextValue = useMemo(
    () => ({
      onNetworkError,
      onNetworkSuccess,
      offlineError,
    }),
    [onNetworkError, onNetworkSuccess, offlineError],
  );

  return (
    <OfflineContext.Provider value={contextValue}>
      {children}
    </OfflineContext.Provider>
  );
};

OfflineContextProvider.propTypes = {
  addMiddleware: PropTypes.func.isRequired,
  children: PropTypes.node,
};

OfflineContextProvider.defaultProps = {
  children: null,
};

export default OfflineContextProvider;
