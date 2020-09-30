import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { DRAWER_QUERY_PARAM, PERMANENT_DRAWER_DESKTOP_WIDTH, PERMANENT_DRAWER_MOBILE_WIDTH } from '@misakey/ui/constants/drawers';

import omit from '@misakey/helpers/omit';
import getNextSearch from '@misakey/helpers/getNextSearch';
import isNil from '@misakey/helpers/isNil';
import isPlainObject from '@misakey/helpers/isPlainObject';
import getSearchParams from '@misakey/helpers/getSearchParams';

import isFunction from '@misakey/helpers/isFunction';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { useLocation, useHistory } from 'react-router-dom';


import Box from '@material-ui/core/Box';
import Drawer from '@material-ui/core/Drawer';
import { useTheme, useMediaQuery } from '@material-ui/core';

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
  drawer: ({ drawerWidth }) => ({
    width: drawerWidth,
    flexShrink: 0,
    boxSizing: 'unset',
  }),
  drawerPaper: ({ drawerWidth }) => ({
    width: drawerWidth,
  }),
  content: {
    height: 'inherit',
    position: 'relative',
    backgroundColor: theme.palette.background.default,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  contentShift: ({ drawerWidth }) => ({
    width: `calc(100% - ${drawerWidth})`,
    marginLeft: drawerWidth,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

/*
* ScreenDrawer displays `drawerChildren` on the left on the screen and `children` on the right.
* Drawer is persistent. By default it is:
    - open on desktop (30% of the screen)
    - hidden on mobile with actions to open it (100% of the screen)
* Drawer can be opened with `toggleDrawer` method or with `leftDrawer` query parameter
(see getNextDrawerSearch)
* `children` and `drawerChildren` can be simple element or function. If their are function, props
  from ScreenDrawer will be provided to their children:
     - isDrawerOpen: if drawer if open or not (usefull to display a button to open it or not)
     - toggleDrawer: open or close the drawer
     - drawerWidth: can be user to compute and force width of children AppBar for example)
     - selectedDrawer: return the value of `tmpDrawer` or `drawer` in queryParams
     - getNextDrawerSearch: method that handle the queryParams to display drawerContent
     - setIsDrawerForceClosed: force drawer to close on desktop (used for displaying Screen locked)
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
* getNextDrawerSearch(value) put value in queryParams `leftDrawer`,
then it can be used in children to determine which content displaying if the drawer
*/


function ScreenDrawer({
  drawerChildren, classes, children, isFullWidth, initialIsDrawerOpen, ...props
}) {
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });
  const { pathname, search, hash } = useLocation();
  const history = useHistory();
  const [isDrawerForceClosed, setIsDrawerForceClosed] = useState(false);

  const searchParams = getSearchParams(search);

  const leftDrawerQueryParams = useMemo(
    () => searchParams[DRAWER_QUERY_PARAM], [searchParams],
  );

  const isDrawerOpenMobile = useMemo(
    () => !isNil(leftDrawerQueryParams) || initialIsDrawerOpen,
    [initialIsDrawerOpen, leftDrawerQueryParams],
  );

  const isDrawerOpenDesktop = useMemo(
    () => isFullWidth || (!isSmDown && !isDrawerForceClosed),
    [isDrawerForceClosed, isFullWidth, isSmDown],
  );

  const isDrawerOpen = useMemo(
    () => isDrawerOpenMobile || isDrawerOpenDesktop,
    [isDrawerOpenDesktop, isDrawerOpenMobile],
  );

  const drawerWidth = useMemo(
    () => (isSmDown || isFullWidth
      ? PERMANENT_DRAWER_MOBILE_WIDTH
      : PERMANENT_DRAWER_DESKTOP_WIDTH),
    [isFullWidth, isSmDown],
  );
  const internalClasses = useStyles({ drawerWidth });

  const getNextDrawerSearch = useCallback((value) => ({
    pathname,
    hash,
    search: getNextSearch(search, new Map([[DRAWER_QUERY_PARAM, value]])),
  }), [hash, pathname, search]);

  const toggleDrawer = useCallback(
    (e, value = DEFAULT) => {
      const newParameter = !isNil(leftDrawerQueryParams) ? undefined : value;
      history.replace(getNextDrawerSearch(newParameter));
    }, [getNextDrawerSearch, history, leftDrawerQueryParams],
  );


  const drawerProps = useMemo(
    () => ({
      isDrawerOpen,
      toggleDrawer,
      drawerWidth,
      getNextDrawerSearch,
      selectedDrawer: leftDrawerQueryParams,
      setIsDrawerForceClosed,
    }),
    [isDrawerOpen, toggleDrawer, drawerWidth, getNextDrawerSearch, leftDrawerQueryParams],
  );

  const drawerContent = useMemo(() => {
    if (!isPlainObject(drawerChildren)) {
      return isFunction(drawerChildren) ? drawerChildren(drawerProps) : drawerChildren;
    }
    const drawer = drawerChildren[leftDrawerQueryParams] || drawerChildren[DEFAULT];

    return isFunction(drawer) ? drawer(drawerProps) : drawer;
  }, [drawerChildren, drawerProps, leftDrawerQueryParams]);

  return (
    <>
      <Drawer
        variant="persistent"
        anchor="left"
        open={isDrawerOpen}
        className={internalClasses.drawer}
        classes={{ paper: clsx(classes.drawerPaper, internalClasses.drawerPaper) }}
        {...omit(props, ['staticContext', 'tReady', 't'])}
      >
        {drawerContent}
      </Drawer>
      <Box
        className={clsx(classes.content, internalClasses.content, {
          [internalClasses.contentShift]: isDrawerOpen,
        })}
      >
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
  classes: PropTypes.shape({
    content: PropTypes.string,
    drawerPaper: PropTypes.string,
  }),
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node, PropTypes.func]),
  isFullWidth: PropTypes.bool,
  initialIsDrawerOpen: PropTypes.bool,
};


ScreenDrawer.defaultProps = {
  drawerChildren: null,
  children: null,
  classes: {},
  isFullWidth: false,
  initialIsDrawerOpen: false,
};

export default ScreenDrawer;
