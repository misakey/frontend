import { useMemo, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { TMP_DRAWER_QUERY_PARAMS, SIDE_QUERY_PARAM, TEMP_DRAWER_MOBILE_WIDTH, TEMP_DRAWER_DESKTOP_WIDTH, SIDES } from '@misakey/ui/constants/drawers';

import getNextSearch from '@misakey/helpers/getNextSearch';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useDrawerLayout from '@misakey/hooks/useDrawerLayout';

import Drawer from '@material-ui/core/Drawer';
import DrawerAccountContent from 'components/smart/Drawer/Account/Content';

// CONSTANTS
const ACCOUNT = 'account';

// HOOKS
const useStyles = makeStyles(() => ({
  drawerPaper: ({ drawerWidth }) => ({
    width: drawerWidth,
  }),
}));

// COMPONENTS
const AccountDrawer = (props) => {
  const history = useHistory();
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
    () => tmpDrawerSearch === ACCOUNT, [tmpDrawerSearch],
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
      <DrawerAccountContent
        backTo={hideDrawerTo}
      />
    </Drawer>
  );
};

export default AccountDrawer;
