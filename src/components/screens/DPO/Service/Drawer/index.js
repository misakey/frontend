import clsx from 'clsx';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Link, generatePath, withRouter, matchPath } from 'react-router-dom';

import displayIn from '@misakey/helpers/displayIn';
import isIOS from '@misakey/helpers/isIOS';
import noop from '@misakey/helpers/noop';
import useWidth from '@misakey/hooks/useWidth';

import { makeStyles, useTheme } from '@material-ui/core';
import { menuButtonStyle } from 'components/smart/Layout';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Icon from '@material-ui/core/Icon';
import ListItemText from '@material-ui/core/ListItemText';

import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import CheckIcon from '@material-ui/icons/Check';
import ChatIcon from '@material-ui/icons/Chat';

import routes from 'routes';

import {
  layoutAppBarShift,
  layoutAppBarUnshift,
  layoutBurgerHide,
  layoutBurgerShow,
  layoutBurgerUpdate,
} from 'store/actions/Layout';
import { screenServiceDrawerClose } from 'store/actions/screens/Service/Drawer';

const iOS = isIOS();

export const LIST_ITEMS = {
  requests: {
    icon: ChatIcon,
    color: '#ff9902',
  },
  claim: {
    icon: CheckIcon,
    color: '#1a73e8',
  },
};

export const DRAWER_WIDTH = 280;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexGrow: '1',
    height: '100%',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
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
    overflowX: 'hidden',
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
  content: {
    position: 'relative',
    flexGrow: 1,
    width: '100%',
    height: '100%',
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
}));

const getListItemStyles = (name) => ({
  item: { borderColor: LIST_ITEMS[name].color },
  icon: { backgroundColor: LIST_ITEMS[name].color },
});

const useListItemStyles = (name) => makeStyles(
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

function Drawer({ children, dispatch, location, mainDomain, open, t }) {
  const theme = useTheme();
  const width = useWidth();
  const classes = useStyles();
  const listItemsClasses = getListItemsClasses();

  const handleDrawerOpened = React.useCallback(() => {
    if (open) { dispatch(layoutAppBarShift()); } else { dispatch(layoutAppBarUnshift()); }

    return () => { dispatch(layoutAppBarUnshift()); };
  }, [dispatch, open]);

  const handleDrawerClose = React.useCallback(() => {
    dispatch(layoutAppBarUnshift());
    dispatch(screenServiceDrawerClose());
  }, [dispatch]);

  // @FIXME: use match instead
  const isCurrent = React.useCallback((name) => !!matchPath(location.pathname, {
    path: routes.dpo.service[name]._,
    exact: name === 'home',
  }), [location]);

  const updateBurger = React.useCallback((visible = true) => {
    if (visible) { dispatch(layoutBurgerShow()); } else { dispatch(layoutBurgerHide()); }
    dispatch(layoutBurgerUpdate({
      className: visible ? clsx(classes.menuButton, { [classes.hide]: open }) : '',
    }));
  }, [dispatch, classes, open]);

  const drawerVariant = React.useMemo(
    () => (displayIn(width, ['xs', 'sm']) ? null : 'permanent'),
    [width],
  );

  React.useEffect(handleDrawerOpened, [open]);

  React.useEffect(() => {
    updateBurger();

    return () => {
      updateBurger(false);
      dispatch(layoutAppBarUnshift());
    };
  }, [dispatch, updateBurger]);

  return (
    <div className={classes.root}>
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
          {Object.keys(LIST_ITEMS).map((name) => (
            <ListItem
              component={Link}
              button
              to={generatePath(routes.dpo.service[name]._, { mainDomain })}
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
      <div className={classes.content}>
        {children}
      </div>
    </div>
  );
}

Drawer.propTypes = {
  children: PropTypes.oneOfType([PropTypes.elementType, PropTypes.object]).isRequired,
  dispatch: PropTypes.func.isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string.isRequired }).isRequired,
  mainDomain: PropTypes.string, // from parent Component
  open: PropTypes.bool, // from state.screens.ServiceDrawer
  t: PropTypes.func.isRequired,
};

Drawer.defaultProps = {
  mainDomain: 'service',
  open: false,
};

export default connect(
  (state) => ({ ...state.screens.ServiceDrawer }),
)(withRouter(withTranslation('nav')(Drawer)));
