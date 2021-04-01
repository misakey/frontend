
import React, {
  useMemo,
  forwardRef,
  createContext,
  useContext,
} from 'react';
import PropTypes from 'prop-types';

import isNil from '@misakey/core/helpers/isNil';

import useSafeDestr from '@misakey/hooks/useSafeDestr';

import Menu from '@material-ui/core/Menu';

// CONSTANTS
const MENU_LIST_PROPS = {
  disablePadding: true,
};

// CONTEXT
export const MenuContext = createContext({
  onClose: null,
});

// HOOKS
export const useContextMenuContext = () => useContext(MenuContext);

// COMPONENTS
const ContextMenu = forwardRef(({
  children, anchorPosition, onClose, ...props }, ref) => {
  const { top, left } = useSafeDestr(anchorPosition);

  const hasAnchorPosition = useMemo(
    () => !isNil(top) && !isNil(left),
    [top, left],
  );

  const contextProviderValue = useMemo(
    () => ({ onClose }),
    [onClose],
  );

  return (
    <MenuContext.Provider value={contextProviderValue}>
      <Menu
        ref={ref}
        keepMounted
        open={hasAnchorPosition}
        anchorReference="anchorPosition"
        anchorPosition={anchorPosition}
        onClose={onClose}
        variant="menu"
        MenuListProps={MENU_LIST_PROPS}
        {...props}
      >
        {children}
      </Menu>
    </MenuContext.Provider>
  );
});


ContextMenu.propTypes = {
  children: PropTypes.node,
  anchorPosition: PropTypes.shape({
    top: PropTypes.number,
    left: PropTypes.number,
  }),
  onClose: PropTypes.func.isRequired,
};

ContextMenu.defaultProps = {
  children: null,
  anchorPosition: {},
};

export default ContextMenu;
