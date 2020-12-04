import { useMemo, useRef, createContext, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';

import isNil from '@misakey/helpers/isNil';

// CONTEXT
export const BoxEventSubmitContext = createContext({
  listRef: {},
  scrollToBottom: null,
});

// HOOKS
export const useBoxEventSubmitContext = () => useContext(BoxEventSubmitContext);

// COMPONENTS
const BoxEventSubmitContextProvider = ({ children }) => {
  const listRef = useRef();

  const scrollToBottom = useCallback(
    () => {
      const { current } = listRef;
      if (!isNil(current)) {
        current.scrollToBottom();
      }
    },
    [listRef],
  );


  const contextValue = useMemo(
    () => ({
      listRef,
      scrollToBottom,
    }),
    [listRef, scrollToBottom],
  );

  return (
    <BoxEventSubmitContext.Provider value={contextValue}>
      {children}
    </BoxEventSubmitContext.Provider>
  );
};
BoxEventSubmitContextProvider.propTypes = {
  children: PropTypes.node,
};

BoxEventSubmitContextProvider.defaultProps = {
  children: null,
};

export default BoxEventSubmitContextProvider;
