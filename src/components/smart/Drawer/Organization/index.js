import React, { useMemo, useCallback } from 'react';

import { useHistory, useLocation } from 'react-router-dom';

import {
  TMP_DRAWER_ORG_VALUE,
  TMP_DRAWER_QUERY_PARAMS,
  SIDE_QUERY_PARAM,
  TEMP_DRAWER_MOBILE_WIDTH,
  TEMP_DRAWER_DESKTOP_WIDTH,
  SIDES } from '@misakey/ui/constants/drawers';

import getNextSearch from '@misakey/helpers/getNextSearch';
import isIOS from '@misakey/helpers/isIOS';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useDrawerLayout from '@misakey/hooks/useDrawerLayout';

import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import DrawerOrganizationContent from 'components/smart/Drawer/Organization/Content';

// HOOKS
const useStyles = makeStyles(() => ({
  drawerPaper: ({ drawerWidth }) => ({
    width: drawerWidth,
  }),
}));

// COMPONENTS
const DrawerOrganization = (props) => {
  const { replace } = useHistory();
  const { pathname, search, hash } = useLocation();

  const { isSmDown, tmpDrawerSearch, side } = useDrawerLayout();

  const sideOrDefault = useMemo(
    () => side || SIDES.LEFT,
    [side],
  );

  const swipeableProps = useMemo(
    () => (isIOS() ? {
      disableDiscovery: true,
    } : {
      disableBackdropTransition: true,
    }),
    [],
  );

  const drawerWidth = useMemo(
    () => (isSmDown ? TEMP_DRAWER_MOBILE_WIDTH : TEMP_DRAWER_DESKTOP_WIDTH),
    [isSmDown],
  );
  const classes = useStyles({ drawerWidth });

  const isTmpDrawerOpen = useMemo(
    () => tmpDrawerSearch === TMP_DRAWER_ORG_VALUE, [tmpDrawerSearch],
  );

  const hideDrawerTo = useMemo(
    () => ({
      pathname,
      hash,
      search: getNextSearch(search, new Map([
        [TMP_DRAWER_QUERY_PARAMS, undefined],
      ])),
    }),
    [hash, pathname, search],
  );

  const showDrawerTo = useMemo(
    () => ({
      pathname,
      hash,
      search: getNextSearch(search, new Map([
        [TMP_DRAWER_QUERY_PARAMS, TMP_DRAWER_ORG_VALUE],
      ])),
    }),
    [hash, pathname, search],
  );

  const exitedTo = useMemo(
    () => ({
      pathname,
      hash,
      search: getNextSearch(search, new Map([
        [SIDE_QUERY_PARAM, undefined],
      ])),
    }),
    [hash, pathname, search],
  );

  const onClose = useCallback(
    () => replace(hideDrawerTo),
    [hideDrawerTo, replace],
  );

  const onOpen = useCallback(
    () => replace(showDrawerTo),
    [replace, showDrawerTo],
  );

  const onExited = useCallback(
    () => replace(exitedTo),
    [exitedTo, replace],
  );

  const SlideProps = useMemo(
    () => ({ onExited }),
    [onExited],
  );

  return (
    <SwipeableDrawer
      variant="temporary"
      anchor={sideOrDefault}
      open={isTmpDrawerOpen}
      onClose={onClose}
      onOpen={onOpen}
      SlideProps={SlideProps}
      classes={{ paper: classes.drawerPaper }}
      {...swipeableProps}
      {...props}
    >
      <DrawerOrganizationContent
        backTo={hideDrawerTo}
      />
    </SwipeableDrawer>
  );
};

export default DrawerOrganization;
