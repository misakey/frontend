
import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  forwardRef,
  createContext,
  useContext,
} from 'react';
import PropTypes from 'prop-types';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import path from '@misakey/helpers/path';
import head from '@misakey/helpers/head';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useCombinedRefs from '@misakey/hooks/useCombinedRefs';
import makeStyles from '@material-ui/core/styles/makeStyles';

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
const touchRefTargetPath = path(['current', 'target']);

// HOOKS
const useStyles = makeStyles(() => ({
  popper: ({ popperAnchorEl }) => ({
    height: popperAnchorEl ? popperAnchorEl.clientHeight : null,
  }),
}));

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
  let ComponentWithContextMenu = ({ items, menuProps, children, permanent, ...props }, ref) => {
    const [mouse, setMouse] = useState(INITIAL_MOUSE);

    const [popperAnchorEl, setPopperAnchorEl] = useState(null);

    const touchRef = useRef();

    const combinedRef = useCombinedRefs(ref);

    const classes = useStyles({ popperAnchorEl });

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

    const contextProviderValue = useMemo(
      () => ({ onClose }),
      [onClose],
    );

    const onTouchStart = useCallback(
      (e) => {
        const { target, touches } = e;
        if (hasHref(target) || touches.length > 1) {
          return;
        }
        if (hasItems) {
          touchRef.current = head(touches);
        }
      },
      [touchRef, hasItems],
    );

    const onTouchMove = useCallback(
      () => {
        touchRef.current = undefined;
      },
      [touchRef],
    );

    const onTouchEnd = useCallback(
      (e) => {
        const { target } = e;
        const touchRefTarget = touchRefTargetPath(touchRef);
        if (hasHref(target) || target !== touchRefTarget) {
          return;
        }
        e.preventDefault();
        const { current } = touchRef;
        setMouse({
          x: current.clientX,
          y: current.clientY,
        });
      },
      [setMouse, touchRef],
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

    const hoverProps = useMemo(
      () => (permanent
        ? {}
        : {
          onMouseEnter: onEnter,
          onMouseLeave: onLeave,
        }),
      [permanent, onEnter, onLeave],
    );

    const touchProps = useMemo(
      () => (permanent
        ? {}
        : { onTouchStart, onTouchMove, onTouchEnd }
      ),
      [permanent, onTouchStart, onTouchMove, onTouchEnd],
    );

    useEffect(
      () => {
        if (permanent) {
          setPopperAnchorEl(combinedRef.current);
        }
      },
      [setPopperAnchorEl, combinedRef, permanent],
    );

    return (
      <>
        <Component
          ref={combinedRef}
          onContextMenu={onContextMenu}
          isSelected={hasMousePosition}
          {...touchProps}
          {...hoverProps}
          {...props}
        >
          <Popper
            anchorEl={popperAnchorEl}
            open={Boolean(popperAnchorEl)}
            placement="right-start"
            className={classes.popper}
          >
            <IconButton onClick={onContextMenu}>
              <MoreHorizIcon />
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
    permanent: PropTypes.bool,
  };

  ComponentWithContextMenu.defaultProps = {
    items: null,
    menuProps: {},
    children: null,
    permanent: false,
  };

  return ComponentWithContextMenu;
};

export default withContextMenu;
