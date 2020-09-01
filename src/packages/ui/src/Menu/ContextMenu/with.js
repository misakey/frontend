
import React, { useState, useMemo, useCallback, forwardRef, createContext, useContext } from 'react';
import PropTypes from 'prop-types';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useCombinedRefs from '@misakey/hooks/useCombinedRefs';

import Menu from '@material-ui/core/Menu';
import IconButton from '@material-ui/core/IconButton';
import Popper from '@material-ui/core/Popper';

import MoreHorizIcon from '@material-ui/icons/MoreHoriz';

// CONSTANTS
const MENU_LIST_PROPS = {
  disablePadding: true,
};

const INITIAL_MOUSE = {
  x: null,
  y: null,
};

// HELPERS
const hasHref = (element) => !isEmpty(element.href);

// CONTEXT
export const MenuContext = createContext({
  onClose: null,
});

// HOOKS
export const useContextMenuContext = () => useContext(MenuContext);

// COMPONENTS
const withContextMenu = (Component) => {
  // NB: items requires nodes in array synthax not to trigger material-ui warnings
  // https://github.com/mui-org/material-ui/issues/16181
  // ex: items={[<MenuItem>a</MenuItem>, <MenuItem>b</MenuItem>]}
  let ComponentWithContextMenu = ({ items, menuProps, children, ...props }, ref) => {
    const [mouse, setMouse] = useState(INITIAL_MOUSE);

    const [popperAnchorEl, setPopperAnchorEl] = useState(null);

    const combinedRef = useCombinedRefs(ref);

    const { x, y } = useSafeDestr(mouse);

    const hasMousePosition = useMemo(
      () => !isNil(x) && !isNil(y),
      [x, y],
    );

    const hasItems = useMemo(
      () => !isEmpty(items),
      [items],
    );

    const anchorPosition = useMemo(
      () => (hasMousePosition
        ? { top: y, left: x }
        : undefined),
      [hasMousePosition, x, y],
    );

    const onContextMenu = useCallback(
      (e) => {
        if (hasHref(e.target)) {
          return;
        }
        e.preventDefault();
        if (hasItems) {
          setMouse({
            x: e.clientX,
            y: e.clientY,
          });
        }
      },
      [setMouse, hasItems],
    );

    const onClose = useCallback(
      () => {
        setMouse(INITIAL_MOUSE);
      },
      [setMouse],
    );

    const onEnter = useCallback(
      () => {
        setPopperAnchorEl(combinedRef.current);
      },
      [setPopperAnchorEl, combinedRef],
    );

    const onLeave = useCallback(
      () => {
        setPopperAnchorEl(null);
      },
      [setPopperAnchorEl],
    );

    const contextProviderValue = useMemo(
      () => ({ onClose }),
      [onClose],
    );

    return (
      <>
        <Component
          ref={combinedRef}
          onContextMenu={onContextMenu}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          {...props}
        >
          <Popper
            anchorEl={popperAnchorEl}
            open={Boolean(popperAnchorEl)}
            placement="right-start"
          >
            <IconButton size="small" onClick={onContextMenu}>
              <MoreHorizIcon fontSize="small" />
            </IconButton>
          </Popper>
          {children}
        </Component>
        <MenuContext.Provider value={contextProviderValue}>
          <Menu
            keepMounted
            open={hasMousePosition}
            anchorReference="anchorPosition"
            anchorPosition={anchorPosition}
            onClose={onClose}
            variant="menu"
            MenuListProps={MENU_LIST_PROPS}
            {...menuProps}
          >
            {items}
          </Menu>
        </MenuContext.Provider>
      </>
    );
  };

  ComponentWithContextMenu = forwardRef(ComponentWithContextMenu);

  ComponentWithContextMenu.propTypes = {
    items: PropTypes.node,
    menuProps: PropTypes.object,
    children: PropTypes.node,
  };

  ComponentWithContextMenu.defaultProps = {
    items: null,
    menuProps: {},
    children: null,
  };

  return ComponentWithContextMenu;
};

export default withContextMenu;
