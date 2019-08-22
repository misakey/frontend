import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link, generatePath, withRouter, matchPath } from 'react-router-dom';
import routes from 'routes';

import clsx from 'clsx';
import noop from '@misakey/helpers/noop';
import displayIn from '@misakey/helpers/displayIn';
import useWidth from '@misakey/hooks/useWidth';

import { fade, makeStyles, useTheme } from '@material-ui/core/styles';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import CssBaseline from '@material-ui/core/CssBaseline';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Icon from '@material-ui/core/Icon';
import InputBase from '@material-ui/core/InputBase';

import Portal from '@misakey/ui/Portal';

import SearchIcon from '@material-ui/icons/Search';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import HomeIcon from '@material-ui/icons/Home';
import InfoIcon from '@material-ui/icons/Info';
import GroupIcon from '@material-ui/icons/Group';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import StorageIcon from '@material-ui/icons/Storage';
import ChatIcon from '@material-ui/icons/Chat';

import ButtonBurger from 'components/dumb/Button/Burger';
import ElevationScroll from 'components/dumb/ElevationScroll';
import ButtonConnect from 'components/dumb/Button/Connect';

// @FIXME: use helper isIOS from @misakey/helpers/isIOS when released
// https://gitlab.com/Misakey/js-common/merge_requests/14
const iOS = process.browser && /iPad|iPhone|iPod/.test(navigator.userAgent);

export const LEFT_PORTAL_ID = 'LayoutLeftPortal';
export const RIGHT_PORTAL_ID = 'LayoutRightPortal';

export const LIST_ITEMS = {
  home: {
    icon: HomeIcon,
    color: '#ff9902',
  },
  information: {
    icon: InfoIcon,
    color: '#00ff03',
  },
  sso: {
    icon: VpnKeyIcon,
    color: '#00ffff',
  },
  users: {
    icon: GroupIcon,
    color: '#4a86e8',
  },
  data: {
    icon: StorageIcon,
    color: '#ff00ff',
  },
  requests: {
    icon: ChatIcon,
    color: '#1a73e8',
  },
};

export const NAV_HEIGHT = 64;
export const DRAWER_WIDTH = 280;

// We export it in case we want to reuse the style with the left Portal
// Going to make a high level Component for Navigation AppBar type
export const menuButtonStyle = theme => ({
  marginRight: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    marginRight: theme.spacing(4),
  },
});

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: DRAWER_WIDTH,
    width: '100%',
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${DRAWER_WIDTH}px)`,
    },
  },
  menuButton: menuButtonStyle(theme),
  hide: {
    display: 'none',
  },
  drawer: {
    width: DRAWER_WIDTH,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: DRAWER_WIDTH,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    border: 'none',
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  content: {
    position: 'relative',
    flexGrow: 1,
    width: '100%',
    minHeight: '100vh',
    paddingTop: NAV_HEIGHT,
  },
  current: {
    borderLeft: '4px solid black',
    paddingLeft: '12px',
    backgroundColor: '#ebebeb',
  },
  listItemIcon: {
    minWidth: '57px',
  },
  icon: {
    padding: '3px',
    borderRadius: '5px',
    color: theme.palette.common.white,
    [theme.breakpoints.up('sm')]: {
      width: '34px',
      height: '34px',
      margin: '0 3px',
    },
  },
  portal: {
    flexGrow: 1,
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.black, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.black, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
  searchIcon: {
    width: theme.spacing(7),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 7),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 120,
      '&:focus': {
        width: 360,
      },
    },
  },
  buttonConnect: {
    marginLeft: theme.spacing(2),
    whiteSpace: 'nowrap',
  },
}));

const getListItemStyles = name => ({
  item: { borderColor: LIST_ITEMS[name].color },
  icon: { backgroundColor: LIST_ITEMS[name].color },
});

const useListItemStyles = name => makeStyles(
  getListItemStyles(name),
  [LIST_ITEMS],
);

const getListItemsClasses = () => {
  const classes = {};
  Object.keys(LIST_ITEMS).forEach((name) => {
    classes[name] = useListItemStyles(name)();
  });

  return classes;
};

function Layout({ children, location, mainDomain, t }) {
  const theme = useTheme();
  const width = useWidth();
  const classes = useStyles();
  const listItemsClasses = getListItemsClasses();

  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = React.useCallback(() => { setOpen(true); }, [setOpen]);
  const handleDrawerClose = React.useCallback(() => { setOpen(false); }, [setOpen]);
  const isCurrent = React.useCallback(name => !!matchPath(location.pathname, {
    path: routes.service[name]._,
    exact: name === 'home',
  }), [location]);

  function Portals() {
    return (
      <>
        <Portal elementId={LEFT_PORTAL_ID}>
          <ButtonBurger
            className={clsx(classes.menuButton, { [classes.hide]: open })}
            onClick={handleDrawerOpen}
          />
        </Portal>
        <Portal elementId={RIGHT_PORTAL_ID}>
          <ButtonConnect className={classes.buttonConnect} />
        </Portal>
      </>
    );
  }

  const drawerVariant = React.useMemo(
    () => (displayIn(width, ['xs', 'sm']) ? null : 'permanent'),
    [width],
  );

  return (
    <div className={classes.root}>
      <CssBaseline />
      <ElevationScroll>
        <AppBar
          position="fixed"
          color="inherit"
          elevation={0}
          className={clsx(classes.appBar, {
            [classes.appBarShift]: open,
          })}
        >
          <Toolbar>
            <div id={LEFT_PORTAL_ID} className={classes.portal} />
            <div className={classes.search}>
              <div className={classes.searchIcon}>
                <SearchIcon />
              </div>
              <InputBase
                placeholder={t('nav:search.placeholder')}
                classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                }}
                inputProps={{ 'aria-label': t('nav:search.label') }}
              />
            </div>
            <div id={RIGHT_PORTAL_ID} />
          </Toolbar>
        </AppBar>
      </ElevationScroll>
      <SwipeableDrawer
        onOpen={noop}
        onClose={noop}
        disableBackdropTransition={!iOS}
        disableDiscovery={iOS}
        elevation={0}
        variant={drawerVariant}
        className={clsx(classes.drawer, {
          [classes.drawerOpen]: open,
          [classes.drawerClose]: !open,
        })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
        open={open}
      >
        <div className={classes.toolbar}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </div>
        {open && <Divider />}
        <List>
          {Object.keys(LIST_ITEMS).map(name => (
            <ListItem
              component={Link}
              button
              to={generatePath(routes.service[name]._, { mainDomain })}
              key={name}
              className={clsx(listItemsClasses[name].item, { [classes.current]: isCurrent(name) })}
            >
              <ListItemIcon className={classes.listItemIcon}>
                <Icon
                  component={LIST_ITEMS[name].icon}
                  className={clsx(classes.icon, listItemsClasses[name].icon)}
                />
              </ListItemIcon>
              <ListItemText primary={t(`nav:drawer.list.items.${name}`)} />
            </ListItem>
          ))}
        </List>
      </SwipeableDrawer>
      <main className={classes.content}>
        {children}
      </main>
      <Portals />
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.oneOfType([PropTypes.elementType, PropTypes.object]).isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string.isRequired }).isRequired,
  mainDomain: PropTypes.string,
  t: PropTypes.func.isRequired,
};

Layout.defaultProps = {
  mainDomain: 'service',
};

export default withRouter(withTranslation(['nav', 'auth'])(Layout));
