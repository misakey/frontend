import React, { useCallback, useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useHistory } from 'react-router-dom';

import Box from '@material-ui/core/Box';
import Drawer from '@material-ui/core/Drawer';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import useTheme from '@material-ui/core/styles/useTheme';
import { makeStyles } from '@material-ui/core/styles';
import getNextSearch from '@misakey/helpers/getNextSearch';
import getSearchParams from '@misakey/helpers/getSearchParams';
import isNil from '@misakey/helpers/isNil';
import isPlainObject from '@misakey/helpers/isPlainObject';

import isFunction from '@misakey/helpers/isFunction';

const TMP_DRAWER = 'tmpDrawer';
const DRAWER = 'drawer';

const DEFAULT = 'default';

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
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const { pathname, search } = useLocation();
  const history = useHistory();
  const searchParams = getSearchParams(search);

  const drawerWidth = useMemo(
    () => {
      if (isSmDown) { return isFullWidth ? '100%' : '90%'; }
      return '30%';
    },
    [isSmDown, isFullWidth],
  );
  const classes = useStyles({ drawerWidth });

  const initialTmpDrawerOpen = useMemo(
    () => !isNil(searchParams[TMP_DRAWER]) || isFullWidth,
    [isFullWidth, searchParams],
  );

  const [isTmpDrawerOpen, setIsTmpDrawerOpen] = useState(false);

  const displayTempDrawer = useMemo(
    () => !isNil(searchParams[TMP_DRAWER]) || isSmDown,
    [isSmDown, searchParams],
  );

  const selectedDrawer = useMemo(
    () => searchParams[TMP_DRAWER] || searchParams[DRAWER], [searchParams],
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
      toggleDrawer,
      drawerWidth,
      getNextDrawerSearch,
      selectedDrawer,
    }),
    [drawerWidth, getNextDrawerSearch, isTmpDrawerOpen, isSmDown, selectedDrawer, toggleDrawer],
  );

  const drawerContent = useMemo(() => {
    if (!isPlainObject(drawerChildren)) {
      return isFunction(drawerChildren) ? drawerChildren(drawerProps) : drawerChildren;
    }
    const drawer = drawerChildren[selectedDrawer] || drawerChildren[DEFAULT];

    return isFunction(drawer) ? drawer(drawerProps) : drawer;
  }, [drawerChildren, drawerProps, selectedDrawer]);

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
