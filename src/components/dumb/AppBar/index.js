import React, { useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import MuiAppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import map from '@misakey/helpers/map';

import User from 'components/smart/User';
import ElevationScroll from 'components/dumb/ElevationScroll';
import PausePluginButton from 'components/smart/PausePluginButton';
import SearchApplications from 'components/smart/Search/Applications';
import { DRAWER_WIDTH } from 'constants/ui/sizes';
import AppBarSearch from 'components/dumb/AppBar/Search';
import useWidth from '@misakey/hooks/useWidth';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import { SMALL_BREAKPOINTS } from 'constants/ui/medias';
import { isDesktopDevice } from 'helpers/devices';

const useStyles = makeStyles((theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarFixedHeight: {
    height: 56,
  },
  appBarShift: (drawerWidth) => ({
    marginLeft: drawerWidth,
    width: '100%',
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  }),
  grow: {
    flexGrow: 1,
  },
}));

function ResponsiveSearch({ onButtonClick, searchBarProps, shift }) {
  const width = useWidth();

  if (SMALL_BREAKPOINTS.includes(width) || shift) {
    return (
      <IconButton
        edge="start"
        color="inherit"
        aria-label="open drawer"
        onClick={onButtonClick}
      >
        <SearchIcon />
      </IconButton>
    );
  }

  return <SearchApplications {...searchBarProps} />;
}

ResponsiveSearch.propTypes = {
  onButtonClick: PropTypes.func.isRequired,
  searchBarProps: PropTypes.object,
  shift: PropTypes.bool.isRequired,
};

ResponsiveSearch.defaultProps = {
  searchBarProps: {},
};

function AppBar({
  className, drawerWidth, elevationScroll, elevationScrollProps, items, searchBarProps,
  shift, toolbarProps, withPausePluginButton, withSearchBar, withUser, ...rest
}) {
  const classes = useStyles(drawerWidth);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const handleSearchClose = useCallback(() => setSearchOpen(false), [setSearchOpen]);
  const handleSearchOpen = useCallback(() => setSearchOpen(true), [setSearchOpen]);

  const rightAppBarItems = useMemo(() => {
    const rightItems = [];
    if (withPausePluginButton) { rightItems.push(<PausePluginButton />); }
    if (withUser) { rightItems.push(<User />); }

    return rightItems;
  }, [withPausePluginButton, withUser]);

  const render = (
    <MuiAppBar
      component="nav"
      position="fixed"
      color="inherit"
      elevation={0}
      className={clsx(
        classes.appBar,
        {
          [classes.appBarShift]: shift,
          [classes.appBarFixedHeight]: window.env.PLUGIN && isDesktopDevice(),
        },
        className,
      )}
      {...rest}
    >
      {!isSearchOpen && (
        <Toolbar {...toolbarProps} className={clsx(classes.toolbar, toolbarProps.className)}>
          {map(items, (item, i) => <span key={`appBarLeftItem-${i}`}>{item}</span>)}
          <div className={classes.grow} />
          {withSearchBar && (
            <ResponsiveSearch
              searchBarProps={searchBarProps}
              onButtonClick={handleSearchOpen}
              shift={shift}
            />
          )}
          {map(rightAppBarItems, (item, i) => <span key={`appBarRightItem-${i}`}>{item}</span>)}
        </Toolbar>
      )}
      <AppBarSearch open={isSearchOpen} onClose={handleSearchClose} {...searchBarProps} />
    </MuiAppBar>
  );

  return elevationScroll
    ? <ElevationScroll {...elevationScrollProps}>{render}</ElevationScroll>
    : render;
}

AppBar.propTypes = {
  className: PropTypes.string,
  drawerWidth: PropTypes.number,
  elevationScroll: PropTypes.bool,
  elevationScrollProps: PropTypes.objectOf(PropTypes.any),
  items: PropTypes.arrayOf(PropTypes.node),
  searchBarProps: PropTypes.objectOf(PropTypes.any),
  shift: PropTypes.bool,
  toolbarProps: PropTypes.objectOf(PropTypes.any),
  withPausePluginButton: PropTypes.bool,
  withSearchBar: PropTypes.bool,
  withUser: PropTypes.bool,
};

AppBar.defaultProps = {
  className: '',
  drawerWidth: DRAWER_WIDTH,
  elevationScroll: true,
  elevationScrollProps: {},
  items: [],
  searchBarProps: {},
  shift: false,
  toolbarProps: { className: '' },
  withPausePluginButton: window.env.PLUGIN === true,
  withSearchBar: !window.env.PLUGIN,
  withUser: true,
};

export default AppBar;
