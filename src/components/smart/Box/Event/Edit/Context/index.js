import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

import { EDITABLE_EVENT_TYPES } from 'constants/app/boxes/events';

// CONSTANTS
const INITIAL_EVENT = null;

// CONTEXT
export const BoxEditEventContext = createContext({
  event: INITIAL_EVENT,
  editEvent: null,
  clearEvent: null,
});

// HOOKS
export const useBoxEditEventContext = () => useContext(BoxEditEventContext);

// COMPONENTS
const BoxEditEventContextProvider = ({ children }) => {
  const [event, setEvent] = useState(INITIAL_EVENT);

  const editEvent = useCallback(
    (e) => {
      if (EDITABLE_EVENT_TYPES.includes(e.type)) {
        // Refreshes context value anytime we trigger edit
        setEvent({ ...e });
      }
    },
    [setEvent],
  );

  const clearEvent = useCallback(
    () => {
      setEvent(null);
    },
    [setEvent],
  );

  const contextValue = useMemo(
    () => ({
      event,
      editEvent,
      clearEvent,
    }),
    [event, editEvent, clearEvent],
  );

  return (
    <BoxEditEventContext.Provider value={contextValue}>
      {children}
    </BoxEditEventContext.Provider>
  );
};

BoxEditEventContextProvider.propTypes = {
  children: PropTypes.node,
};

BoxEditEventContextProvider.defaultProps = {
  children: null,
};

export default BoxEditEventContextProvider;
