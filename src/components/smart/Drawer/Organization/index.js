import React, { Suspense, useMemo, useCallback } from 'react';

import { useHistory, useLocation, Link } from 'react-router-dom';

import {
  TMP_DRAWER_ORG_VALUE,
  TMP_DRAWER_QUERY_PARAMS,
  SIDE_QUERY_PARAM,
  TEMP_DRAWER_MOBILE_WIDTH,
  TEMP_DRAWER_DESKTOP_WIDTH,
  SIDES } from '@misakey/ui/constants/drawers';

import getNextSearch from '@misakey/helpers/getNextSearch';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { useTranslation } from 'react-i18next';
import useDrawerLayout from '@misakey/hooks/useDrawerLayout';

import Drawer from '@material-ui/core/Drawer';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import IconButtonAppBar from '@misakey/ui/IconButton/AppBar';
import Box from '@material-ui/core/Box';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import ListNavigationOrganization from 'components/smart/List/Navigation/Organization';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import ListBordered from '@misakey/ui/List/Bordered';
import ListItemOrganizationSelf from 'components/smart/ListItem/Organization/Self';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';

// HOOKS
const useStyles = makeStyles(() => ({
  drawerPaper: ({ drawerWidth }) => ({
    width: drawerWidth,
  }),
}));

// COMPONENTS
const DrawerOrganization = (props) => {
  const history = useHistory();
  const { t } = useTranslation('common');
  const { pathname, search, hash } = useLocation();

  const { isSmDown, tmpDrawerSearch, side } = useDrawerLayout();

  const sideOrDefault = useMemo(
    () => side || SIDES.LEFT,
    [side],
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
    () => history.replace(hideDrawerTo),
    [hideDrawerTo, history],
  );

  const onExited = useCallback(
    () => history.replace(exitedTo),
    [exitedTo, history],
  );

  const SlideProps = useMemo(
    () => ({ onExited }),
    [onExited],
  );

  return (
    <Drawer
      variant="temporary"
      anchor={sideOrDefault}
      open={isTmpDrawerOpen}
      onClose={onClose}
      SlideProps={SlideProps}
      classes={{ paper: classes.drawerPaper }}
      {...props}
    >
      <Box minHeight="100%" display="flex" flexDirection="column" overflow="hidden">
        <AppBarStatic>
          <IconButtonAppBar
            aria-label={t('common:goBack')}
            edge="start"
            component={Link}
            to={hideDrawerTo}
          >
            <ArrowBackIcon />
          </IconButtonAppBar>
          <BoxFlexFill />
          <ListBordered
            dense
            disablePadding
          >
            <ListItemOrganizationSelf />
          </ListBordered>
        </AppBarStatic>
        <Suspense fallback={<SplashScreen />}>
          <ListNavigationOrganization />
        </Suspense>
      </Box>
    </Drawer>
  );
};

export default DrawerOrganization;
