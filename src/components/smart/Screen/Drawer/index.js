import React, { useCallback, useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import getNextSearch from '@misakey/helpers/getNextSearch';
import isNil from '@misakey/helpers/isNil';
import isPlainObject from '@misakey/helpers/isPlainObject';

import isFunction from '@misakey/helpers/isFunction';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useDrawerLayout, { TMP_DRAWER, DRAWER } from '@misakey/hooks/useDrawerLayout';
import { useLocation, useHistory } from 'react-router-dom';


import Box from '@material-ui/core/Box';
import Drawer from '@material-ui/core/Drawer';

// CONSTANTS
export const DEFAULT = 'default';

export const DRAWER_PROPS_PROP_TYPES = {
  isDrawerOpen: PropTypes.bool,
  animationDone: PropTypes.bool,
  toggleDrawer: PropTypes.func,
  drawerWidth: PropTypes.string,
  getNextDrawerSearch: PropTypes.func,
  selectedDrawer: PropTypes.bool,
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  drawerPaper: ({ drawerWidth }) => ({
    width: drawerWidth,
  }),
  main: ({ drawerWidth }) => ({
    height: 'inherit',
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  }),
}));

/*
* ScreenDrawer displays `drawerChildren` on the left on the screen and `children` on the right.
* `drawerChildren` can be displayed in a permanent drawer (if screen > XS) or a temporary drawer
  (if screen > XS or if `tmpDrawer` is not nil in queryParams)
* `children` and `drawerChildren` can be simple element or function. If their are function, props
  from ScreenDrawer will be provided to their children:
     - isDrawerOpen: if drawer if open or not (usefull to display a button to open it or not)
     - toggleDrawer: open or close the drawer
     - drawerWidth: can be user to compute and force width of children AppBar for example)
     - selectedDrawer: return the value of `tmpDrawer` or `drawer` in queryParams
     - getNextDrawerSearch: method that handle the queryParams to display drawerContent
* drawerChildren can also be an object of shape:
  ```
  {
    // will be displayed if both queryParams drawer of tmpDrawer are nil
    default: (drawerProps) => <DefaultContent {...drawerProps} />,
    // will be displayed if queryParams drawer of tmpDrawer is `otherContent`
    otherContent: (drawerProps) => <OtherContent {...drawerProps},
    ....
  }
  ```
  /!\ do not forget to memoize this object if you use this structure to take advandage of
  reconciliation (https://reactjs.org/docs/reconciliation.html)
* getNextDrawerSearch(value) put value in queryParams `tmpDrawer` (if XS down) or `drawer` (XS up).
  It can be forced to `tmpDrawer` by passing a second parameter (boolean isTmp)
*/

function ScreenDrawer({ drawerChildren, children, isFullWidth, ...props }) {
  const { isSmDown, tmpDrawerSearch, drawerSearch } = useDrawerLayout();
  const { pathname, search } = useLocation();
  const history = useHistory();

  const drawerWidth = useMemo(
    () => {
      if (isSmDown) { return isFullWidth ? '100%' : '90%'; }
      return '30%';
    },
    [isSmDown, isFullWidth],
  );
  const classes = useStyles({ drawerWidth });

  const initialTmpDrawerOpen = useMemo(
    () => (!isNil(tmpDrawerSearch) && !(tmpDrawerSearch === DEFAULT && !isSmDown)) || isFullWidth,
    [isFullWidth, isSmDown, tmpDrawerSearch],
  );

  const [isTmpDrawerOpen, setIsTmpDrawerOpen] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);

  const displayTempDrawer = useMemo(
    () => (!isNil(tmpDrawerSearch)) || isSmDown,
    [isSmDown, tmpDrawerSearch],
  );

  const selectedDrawer = useMemo(
    () => tmpDrawerSearch || drawerSearch, [tmpDrawerSearch, drawerSearch],
  );

  const getNextDrawerSearch = useCallback((value, isTmp = isSmDown) => ({
    pathname,
    search: getNextSearch(search, new Map([[isTmp ? TMP_DRAWER : DRAWER, value]])),
  }), [isSmDown, pathname, search]);

  const toggleDrawer = useCallback(
    (e, value = DEFAULT, isTmp = isSmDown) => {
      const newParameter = !isNil(selectedDrawer) ? undefined : value;
      history.replace(getNextDrawerSearch(newParameter, isTmp));
    }, [getNextDrawerSearch, history, isSmDown, selectedDrawer],
  );

  const onClose = useCallback(
    () => {
      history.replace(getNextDrawerSearch(undefined, true));
    },
    [getNextDrawerSearch, history],
  );

  const drawerProps = useMemo(
    () => ({
      isDrawerOpen: isTmpDrawerOpen || !isSmDown,
      animationDone,
      toggleDrawer,
      drawerWidth,
      getNextDrawerSearch,
      selectedDrawer,
    }),
    [
      toggleDrawer, getNextDrawerSearch,
      drawerWidth, isTmpDrawerOpen, isSmDown, selectedDrawer, animationDone,
    ],
  );

  const drawerContent = useMemo(() => {
    if (!isPlainObject(drawerChildren)) {
      return isFunction(drawerChildren) ? drawerChildren(drawerProps) : drawerChildren;
    }
    const drawer = drawerChildren[selectedDrawer] || drawerChildren[DEFAULT];

    return isFunction(drawer) ? drawer(drawerProps) : drawer;
  }, [drawerChildren, drawerProps, selectedDrawer]);

  const onSlideEntering = useCallback(
    () => setAnimationDone(false),
    [setAnimationDone],
  );

  const onSlideEntered = useCallback(
    () => setAnimationDone(true),
    [setAnimationDone],
  );

  const SlideProps = useMemo(
    () => ({ onEntered: onSlideEntered, onEntering: onSlideEntering }),
    [onSlideEntering, onSlideEntered],
  );

  useEffect(() => {
    setIsTmpDrawerOpen(initialTmpDrawerOpen);
  }, [initialTmpDrawerOpen]);

  return (
    <>
      {!isSmDown && (
        <Drawer
          variant="permanent"
          anchor="left"
          open
          SlideProps={SlideProps}
          classes={{ paper: classes.drawerPaper }}
          {...props}
        >
          {drawerContent}
        </Drawer>
      )}
      {displayTempDrawer && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={isTmpDrawerOpen}
          onClose={onClose}
          SlideProps={SlideProps}
          classes={{ paper: classes.drawerPaper }}
          {...props}
        >
          {drawerContent}
        </Drawer>
      )}
      <Box className={classes.main}>
        {isFunction(children) ? children(drawerProps) : children}
      </Box>
    </>
  );
}


ScreenDrawer.propTypes = {
  drawerChildren: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.node,
    PropTypes.func,
    PropTypes.shape({
      [DEFAULT]: PropTypes.oneOfType([
        PropTypes.element,
        PropTypes.node,
        PropTypes.func,
      ]).isRequired,
    }),
  ]),
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node, PropTypes.func]),
  isFullWidth: PropTypes.bool,
};


ScreenDrawer.defaultProps = {
  drawerChildren: null,
  children: null,
  isFullWidth: false,
};

export default ScreenDrawer;
