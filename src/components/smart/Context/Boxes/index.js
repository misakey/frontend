import React, { useMemo, createContext, useContext } from 'react';
import PropTypes from 'prop-types';

import STATUSES, { ALL } from 'constants/app/boxes/statuses';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import useWebSocket from '@misakey/hooks/useWebSocket';
import useOnReceiveWSUserBox from 'hooks/useOnReceiveWSUserBox';
import useOnAckWSUserBox from 'hooks/useOnAckWSUserBox';
import { useSelector } from 'react-redux';

// CONSTANTS
const { identityId: IDENTITY_ID_SELECTOR } = authSelectors;

// CONTEXT
export const BoxesContext = createContext({
  activeStatus: ALL,
  search: null,
  refresh: null,
  addBoxItem: null,
});

// HOOKS
export const useBoxesContext = () => useContext(BoxesContext);

// COMPONENTS
const BoxesContextProvider = ({ activeStatus, isReady, children }) => {
  const locationSearchParams = useLocationSearchParams();
  const { search } = useMemo(() => locationSearchParams, [locationSearchParams]);
  const identityId = useSelector(IDENTITY_ID_SELECTOR);

  const webSocketEndpoint = useMemo(
    () => `${window.env.API_WS_ENDPOINT}/box-users/${identityId}/ws`,
    [identityId],
  );

  const onReceiveWSUserBox = useOnReceiveWSUserBox(activeStatus, search);

  const socketRef = useWebSocket(webSocketEndpoint, onReceiveWSUserBox, isReady);

  const onAckWSUserBox = useOnAckWSUserBox(socketRef, identityId);

  const contextValue = useMemo(
    () => ({
      activeStatus,
      search,
      onAckWSUserBox,
    }),
    [activeStatus, onAckWSUserBox, search],
  );

  return (
    <BoxesContext.Provider value={contextValue}>
      {children}
    </BoxesContext.Provider>
  );
};
BoxesContextProvider.propTypes = {
  activeStatus: PropTypes.oneOf(STATUSES),
  isReady: PropTypes.bool.isRequired,
  children: PropTypes.node,
};

BoxesContextProvider.defaultProps = {
  activeStatus: ALL,
  children: null,
};

export default BoxesContextProvider;
