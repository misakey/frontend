import React, { useMemo, Fragment } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { DRAWER_WIDTH } from 'constants/ui/sizes';
import { IS_PLUGIN } from 'constants/plugin';

import map from '@misakey/helpers/map';

import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { makeStyles } from '@material-ui/core/styles';
import useLocationWorkspace from 'hooks/useLocationWorkspace';

import MuiAppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Avatar from '@material-ui/core/Avatar';
import User from 'components/smart/User';
import LinkHome from 'components/dumb/Link/Home';
import Logo from 'components/dumb/Logo';
import ElevationScroll from 'components/dumb/ElevationScroll';
import PausePluginButton from 'components/smart/Plugin/Button/Pause';
import SearchApplications from 'components/smart/Search/Applications';
import BoxFlexFill from 'components/dumb/Box/FlexFill';
import { Typography } from '@material-ui/core';

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
  searchBar: {
    margin: 'auto',
  },
}));

// COMPONENTS
function AppBar({
  className, drawerWidth,
  elevationScroll, shift,
  items, leftItems,
  searchBarProps, toolbarProps, elevationScrollProps,
  withPausePluginButton, withHomeLink, withSearchBar, withUser, t,
  ...rest
}) {
  const classes = useStyles(drawerWidth);
  const theme = useTheme();
  const isXsLayout = useMediaQuery(theme.breakpoints.only('xs'));
  const isSmLayout = useMediaQuery(theme.breakpoints.only('sm'));
  const workspace = useLocationWorkspace();


  const rightAppBarItems = useMemo(() => {
    const rightItems = [];
    if (withPausePluginButton) { rightItems.push(<PausePluginButton key="pausePluginButton" />); }
    if (withUser) { rightItems.push(<User key="appBarUser" />); }

    return rightItems;
  }, [withPausePluginButton, withUser]);

  const isSmallMode = useMemo(
    () => (isXsLayout || (shift && isSmLayout)),
    [isSmLayout, isXsLayout, shift],
  );

  const logoProps = useMemo(
    () => (isSmallMode ? { short: true, component: Avatar } : { width: 100 }),
    [isSmallMode],
  );

  const ParentNode = useMemo(
    () => (elevationScroll ? ElevationScroll : Fragment),
    [elevationScroll],
  );

  return (
    <ParentNode>
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
        {...rest}
      >
        <Toolbar {...toolbarProps}>
          {map(leftItems)}
          {withHomeLink && (
          <LinkHome>
            <Logo {...logoProps} />
            {(!isSmallMode) && (
              <Typography variant="subtitle2">
                {t(`common:workspaces.${workspace}`)}
              </Typography>
            )}
          </LinkHome>
          )}
          {map(items)}
          {withSearchBar ? (
            <SearchApplications className={classes.searchBar} {...searchBarProps} />
          ) : (
            <BoxFlexFill />
          )}
          {map(rightAppBarItems)}
        </Toolbar>
      </MuiAppBar>
    </ParentNode>
  );
}

AppBar.propTypes = {
  t: PropTypes.func.isRequired,
  className: PropTypes.string,
  drawerWidth: PropTypes.number,
  elevationScroll: PropTypes.bool,
  elevationScrollProps: PropTypes.objectOf(PropTypes.any),
  items: PropTypes.arrayOf(PropTypes.node),
  leftItems: PropTypes.arrayOf(PropTypes.node),
  searchBarProps: PropTypes.objectOf(PropTypes.any),
  shift: PropTypes.bool,
  toolbarProps: PropTypes.objectOf(PropTypes.any),
  withPausePluginButton: PropTypes.bool,
  withHomeLink: PropTypes.bool,
  withSearchBar: PropTypes.bool,
  withUser: PropTypes.bool,
};

AppBar.defaultProps = {
  className: '',
  drawerWidth: DRAWER_WIDTH,
  elevationScroll: true,
  elevationScrollProps: IS_PLUGIN ? { target: document.getElementById('root') } : {},
  items: [],
  leftItems: [],
  searchBarProps: {},
  shift: false,
  toolbarProps: { className: '' },
  withPausePluginButton: IS_PLUGIN,
  withHomeLink: !IS_PLUGIN,
  withSearchBar: !IS_PLUGIN,
  withUser: true,
};

export default withTranslation('common')(AppBar);
