import React, { createContext, useMemo, useCallback, useContext, useState } from 'react';
import PropTypes from 'prop-types';

import MenuAccount from 'components/smart/Menu/Account';

// CONTEXT
const MenuAccountContext = createContext({
  onClick: null,
  onClose: null,
});

// HOOKS
export const useMenuAccountContext = () => useContext(MenuAccountContext);

const MenuAccountContextProvider = ({ children, ...props }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const onClick = useCallback(
    (event) => {
      setAnchorEl(event.currentTarget);
    },
    [setAnchorEl],
  );

  const onClose = useCallback(
    () => {
      setAnchorEl(null);
    },
    [setAnchorEl],
  );

  const contextValue = useMemo(
    () => ({
      onClick,
      onClose,
    }),
    [onClick, onClose],
  );

  return (
    <MenuAccountContext.Provider value={contextValue}>
      {children}
      <MenuAccount
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={onClose}
        {...props}
      />
    </MenuAccountContext.Provider>
  );
};

MenuAccountContextProvider.propTypes = {
  children: PropTypes.node,
};

MenuAccountContextProvider.defaultProps = {
  children: null,
};

export default MenuAccountContextProvider;
