import React, { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';

import usePaginateEventsByBox from 'hooks/usePaginateEventsByBox';
import useWebSocket from '@misakey/hooks/useWebSocket';
import useOnReceiveWSBoxEvent from 'hooks/useOnReceiveWSBoxEvent';

// CONTEXT
export const PaginateEventsContext = createContext({
  byPagination: {},
  itemCount: null,
  loadMoreItems: null,
  addItems: null,
});

// HOOKS
export const usePaginateEventsContext = () => useContext(PaginateEventsContext);

// COMPONENTS
const PaginateEventsByBoxContextProvider = ({ children, boxId }) => {
  const contextValue = usePaginateEventsByBox(boxId);

  const onReceiveWSEvent = useOnReceiveWSBoxEvent(boxId, contextValue.addItems);

  const webSocketEndpoint = useMemo(
    () => `${window.env.API_WS_ENDPOINT}/boxes/${boxId}/events/ws`,
    [boxId],
  );

  useWebSocket(webSocketEndpoint, onReceiveWSEvent);

  return (
    <PaginateEventsContext.Provider value={contextValue}>
      {children}
    </PaginateEventsContext.Provider>
  );
};

PaginateEventsByBoxContextProvider.propTypes = {
  boxId: PropTypes.string.isRequired,
  children: PropTypes.node,
};

PaginateEventsByBoxContextProvider.defaultProps = {
  children: null,
};

export default PaginateEventsByBoxContextProvider;
