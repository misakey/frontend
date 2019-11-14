import React, { useCallback, useMemo } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter, matchPath } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import useWidth from '@misakey/hooks/useWidth';

import displayIn from '@misakey/helpers/displayIn';
import { redirectToApp } from 'helpers/plugin';

import routes from 'routes';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CssBaseline from '@material-ui/core/CssBaseline';

import ElevationScroll from 'components/dumb/ElevationScroll';
import ButtonConnect from 'components/dumb/Button/Connect';
import PausePluginButton from 'components/smart/PausePluginButton';
import WarningDrawer from 'components/dumb/PluginWarningDrawer';

import { DRAWER_WIDTH } from 'components/screens/Admin/Service/Drawer';
import ButtonBurger from 'components/dumb/Button/Burger';

import { layoutBurgerClicked } from 'store/actions/Layout';

// import InputSearchRedirect from 'components/smart/Input/Search/Redirect';
import AccountCircle from '@material-ui/icons/AccountCircle';
import LayoutSearch from './Search';

// CONSTANTS
export const LEFT_PORTAL_ID = 'LayoutLeftPortal';
export const RIGHT_PORTAL_ID = 'LayoutRight{Portal}';

export const NAV_HEIGHT = 64;

const SMALL_BREAKPOINTS = ['xs'];

// HELPERS
// We export it in case we want to reuse the style with the left Portal
// Going to make a high level Component for Navigation AppBar type
export const menuButtonStyle = (theme) => ({
  marginRight: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    marginRight: theme.spacing(4),
  },
});

// HOOKS
const useStyles = makeStyles((theme) => ({
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
  toolbar: {
    height: NAV_HEIGHT,
  },
  content: {
    position: 'relative',
    flexGrow: 1,
    width: '100%',
    overflow: 'auto',
    '&.hasAppbar': {
      marginTop: NAV_HEIGHT,
      height: `calc(100vh - ${NAV_HEIGHT}px)`,
    },
  },
  portal: {
    display: 'flex',
    flexGrow: '1',
    flexShrink: '1',
    overflow: 'hidden',
  },
  buttonConnect: {
    flexShrink: '0',
    marginLeft: theme.spacing(2),
    [theme.breakpoints.only('xs')]: {
      marginLeft: '0',
    },
    whiteSpace: 'nowrap',
  },
  buttonTextRounded: {
    borderRadius: '200px',
  },
  iconRoot: {
    width: '40px',
    height: '40px',
  },
}));

function Layout({
  burger,
  burgerProps,
  buttonConnect,
  children,
  dispatch,
  displayAppBar,
  displayWarningDrawer,
  pausePluginButton,
  shift,
  location: { pathname },
}) {
  const classes = useStyles();
  const width = useWidth();

  const isSmallDisplay = useMemo(
    () => displayIn(width, SMALL_BREAKPOINTS),
    [width],
  );

  const buttonProps = useMemo(
    () => (isSmallDisplay ? undefined : { variant: 'outlined' }),
    [isSmallDisplay],
  );

  const noTokenIcon = useMemo(
    () => (
      isSmallDisplay
        ? <AccountCircle classes={{ root: classes.iconRoot }} />
        : null
    ),
    [classes.iconRoot, isSmallDisplay],
  );

  const handleBurgerClick = useCallback(() => {
    dispatch(layoutBurgerClicked());
  }, [dispatch]);

  const isLanding = useMemo(
    () => matchPath(pathname, {
      path: routes._,
      exact: true,
    }),
    [pathname],
  );

  const signInActionForPlugin = useCallback(() => redirectToApp('/'), []);
  const redirectToWebAppAccount = useCallback(() => redirectToApp('/account'), []);

  return (
    <div className={classes.root}>
      <CssBaseline />
      {displayAppBar && (
        <ElevationScroll>
          <AppBar
            position="fixed"
            color="inherit"
            elevation={0}
            className={clsx(classes.appBar, { [classes.appBarShift]: shift })}
          >
            <Toolbar className={classes.toolbar}>
              {burger && <ButtonBurger {...burgerProps} onClick={handleBurgerClick} />}
              <div id={LEFT_PORTAL_ID} className={classes.portal} />
              {(!window.env.PLUGIN && !isLanding) && (
                <LayoutSearch />
              )}
              <div id={RIGHT_PORTAL_ID} />
              {pausePluginButton && <PausePluginButton />}
              {buttonConnect && (
                <ButtonConnect
                  noTokenIcon={noTokenIcon}
                  buttonProps={buttonProps}
                  signInAction={window.env.PLUGIN ? signInActionForPlugin : null}
                  customAction={window.env.PLUGIN ? redirectToWebAppAccount : null}
                  className={clsx(
                    classes.buttonConnect,
                    { [classes.buttonTextRounded]: !isSmallDisplay },
                  )}
                />
              )}
            </Toolbar>
          </AppBar>
        </ElevationScroll>
      )}
      <main className={clsx(classes.content, { hasAppbar: displayAppBar })}>
        {children}
        {displayWarningDrawer && (<WarningDrawer />)}
      </main>
    </div>
  );
}

Layout.propTypes = {
  buttonConnect: PropTypes.bool,
  burger: PropTypes.bool,
  burgerProps: PropTypes.shape({
    className: PropTypes.string,
    onClick: PropTypes.func,
  }),
  dispatch: PropTypes.func.isRequired,
  displayAppBar: PropTypes.bool,
  displayWarningDrawer: PropTypes.bool,
  shift: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.elementType,
    PropTypes.object,
    PropTypes.node,
  ]).isRequired,
  history: PropTypes.shape({ goBack: PropTypes.func, push: PropTypes.func }).isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
  pausePluginButton: PropTypes.bool,
};

Layout.defaultProps = {
  burger: false,
  burgerProps: { className: '' },
  buttonConnect: true,
  displayAppBar: true,
  displayWarningDrawer: false,
  shift: false,
  pausePluginButton: window.env.PLUGIN === true,
};

export default connect(
  (state) => ({ ...state.Layout }),
)(withRouter(withTranslation('nav')(Layout)));
