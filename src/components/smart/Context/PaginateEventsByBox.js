import React, { createContext, useContext } from 'react';
import PropTypes from 'prop-types';

import usePaginateEventsByBox from 'hooks/usePaginateEventsByBox';

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
