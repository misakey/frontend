import React, { useMemo } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { DRAWER_WIDTH } from 'constants/ui/sizes';
import { IS_PLUGIN } from 'constants/plugin';

import map from '@misakey/helpers/map';
import omitTranslationProps from 'helpers/omit/translationProps';

import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { makeStyles } from '@material-ui/core/styles';

import MuiAppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import User from 'components/smart/User';
import ElevationScroll from 'components/dumb/ElevationScroll';
import PausePluginButton from 'components/smart/Plugin/Button/Pause';
import SearchApplications from 'components/smart/Search/Applications';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles((theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
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


function AppBar({
  className, drawerWidth, elevationScroll, elevationScrollProps, items, searchBarProps,
  shift, toolbarProps, withPausePluginButton, withSearchBar, withUser, t, ...rest
}) {
  const classes = useStyles(drawerWidth);
  const theme = useTheme();
  const isSmallLayout = useMediaQuery(theme.breakpoints.down('xs'));

  const rightAppBarItems = useMemo(() => {
    const rightItems = [];
    if (withPausePluginButton) { rightItems.push(<PausePluginButton key="pausePluginButton" />); }
    if (withUser) { rightItems.push(<User key="appBarUser" />); }

    return rightItems;
  }, [withPausePluginButton, withUser]);

  const isSmallMode = useMemo(
    () => (isSmallLayout || shift),
    [isSmallLayout, shift],
  );

  const responsiveSearchProps = isSmallMode
    ? { component: IconButton }
    : {};

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
        },
        className,
      )}
      {...omitTranslationProps(rest)}
    >
      <Toolbar {...toolbarProps}>
        {map(items)}
        <div className={classes.grow} />
        {withSearchBar && (
          <SearchApplications {...responsiveSearchProps} {...searchBarProps}>
            {isSmallMode
              ? (
                <SearchIcon />
              ) : t('common:search')}
          </SearchApplications>
        )}
        {map(rightAppBarItems)}
      </Toolbar>
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
  t: PropTypes.func.isRequired,
};

AppBar.defaultProps = {
  className: '',
  drawerWidth: DRAWER_WIDTH,
  elevationScroll: true,
  elevationScrollProps: IS_PLUGIN ? { target: document.getElementById('root') } : {},
  items: [],
  searchBarProps: {},
  shift: false,
  toolbarProps: { className: '' },
  withPausePluginButton: IS_PLUGIN,
  withSearchBar: !IS_PLUGIN,
  withUser: true,
};

export default withTranslation('common')(AppBar);
