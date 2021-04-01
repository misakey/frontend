import React, { useMemo, createContext, useContext } from 'react';

import PropTypes from 'prop-types';

import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import useWebSocket from '@misakey/hooks/useWebSocket';
import useOnReceiveWSUserBox from 'hooks/useOnReceiveWSUserBox';
import useOnAckWSUserBox from 'hooks/useOnAckWSUserBox';
import { useSelector } from 'react-redux';

// CONSTANTS
const { identityId: IDENTITY_ID_SELECTOR } = authSelectors;

// CONTEXT
export const BoxesContext = createContext({
  search: null,
  onAckWSUserBox: null,
});

// HOOKS
export const useBoxesContext = () => useContext(BoxesContext);

// COMPONENTS
const BoxesContextProvider = ({ children }) => {
  const locationSearchParams = useLocationSearchParams();
  const { search } = useMemo(() => locationSearchParams, [locationSearchParams]);
  const identityId = useSelector(IDENTITY_ID_SELECTOR);

  const webSocketEndpoint = useMemo(
    () => `${window.env.API_WS_ENDPOINT}/box-users/${identityId}/ws`,
    [identityId],
  );

  const onReceiveWSUserBox = useOnReceiveWSUserBox(search);

  const socketRef = useWebSocket(webSocketEndpoint, onReceiveWSUserBox);

  const onAckWSUserBox = useOnAckWSUserBox(socketRef, identityId);

  const contextValue = useMemo(
    () => ({
      search,
      onAckWSUserBox,
    }),
    [onAckWSUserBox, search],
  );

  return (
    <BoxesContext.Provider value={contextValue}>
      {children}
    </BoxesContext.Provider>
  );
};
BoxesContextProvider.propTypes = {
  children: PropTypes.node,
};

BoxesContextProvider.defaultProps = {
  children: null,
};

export default BoxesContextProvider;
