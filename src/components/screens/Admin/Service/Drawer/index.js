import clsx from 'clsx';
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link, generatePath, withRouter, matchPath } from 'react-router-dom';

import displayIn from '@misakey/helpers/displayIn';
import isIOS from '@misakey/helpers/isIOS';
import noop from '@misakey/helpers/noop';
import useWidth from '@misakey/hooks/useWidth';

import { makeStyles, useTheme } from '@material-ui/core';
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
import HomeIcon from '@material-ui/icons/Home';
import InfoIcon from '@material-ui/icons/Info';
import GroupIcon from '@material-ui/icons/Group';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import StorageIcon from '@material-ui/icons/Storage';
import CheckIcon from '@material-ui/icons/Check';

import routes from 'routes';
import { DRAWER_WIDTH } from '@misakey/ui/constants/sizes';

const iOS = isIOS();

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
  claim: {
    icon: CheckIcon,
    color: '#1a73e8',
  },
};

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
    zIndex: theme.zIndex.drawer + 2,
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

function Drawer({ children, location, mainDomain, onClose, open, t, userHasRole }) {
  const theme = useTheme();
  const width = useWidth();
  const classes = useStyles();
  const listItemsClasses = getListItemsClasses();

  // @FIXME: use match instead
  const isCurrent = React.useCallback((name) => !!matchPath(location.pathname, {
    path: routes.admin.service[name]._,
    exact: name === 'home',
  }), [location]);

  const drawerVariant = React.useMemo(
    () => (displayIn(width, ['xs', 'sm']) ? null : 'permanent'),
    [width],
  );

  const itemsToDisplay = useMemo(
    () => (userHasRole ? Object.keys(LIST_ITEMS).filter((key) => key !== 'claim') : Object.keys(LIST_ITEMS)),
    [userHasRole],
  );

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
          <IconButton onClick={onClose}>
            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </div>
        {open && <Divider />}
        <List>
          {itemsToDisplay.map((name) => (
            <ListItem
              component={Link}
              button
              to={generatePath(routes.admin.service[name]._, { mainDomain })}
              key={name}
              className={clsx(listItemsClasses[name].item, { [classes.current]: isCurrent(name) })}
            >
              <ListItemIcon className={classes.listItemIcon}>
                <Icon
                  component={LIST_ITEMS[name].icon}
                  className={clsx(classes.icon, listItemsClasses[name].icon)}
                />
              </ListItemIcon>
              <ListItemText primary={t(`components:drawer.list.items.${name}`)} />
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
  location: PropTypes.shape({ pathname: PropTypes.string.isRequired }).isRequired,
  mainDomain: PropTypes.string, // from parent Component
  onClose: PropTypes.func.isRequired, // from parent Component
  open: PropTypes.bool.isRequired, // from parent Component
  t: PropTypes.func.isRequired,
  userHasRole: PropTypes.bool,
};

Drawer.defaultProps = {
  mainDomain: 'intro',
  userHasRole: false,
};

export default withRouter(withTranslation('components')(Drawer));
