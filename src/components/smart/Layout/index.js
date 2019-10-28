import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import clsx from 'clsx';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CssBaseline from '@material-ui/core/CssBaseline';

import ElevationScroll from 'components/dumb/ElevationScroll';
import ButtonConnect from 'components/dumb/Button/Connect';
import PausePluginButton from 'components/smart/PausePluginButton';
import WarningDrawer from 'components/dumb/PluginWarningDrawer';

import { DRAWER_WIDTH } from 'components/screens/Admin/Service/Drawer';
import ButtonBurger from '@misakey/ui/Button/Burger';

import { layoutBurgerClicked } from 'store/actions/Layout';

import InputSearchRedirect from 'components/smart/Input/Search/Redirect';

export const LEFT_PORTAL_ID = 'LayoutLeftPortal';
export const RIGHT_PORTAL_ID = 'LayoutRight{Portal}';

export const NAV_HEIGHT = 64;

// We export it in case we want to reuse the style with the left Portal
// Going to make a high level Component for Navigation AppBar type
export const menuButtonStyle = (theme) => ({
  marginRight: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    marginRight: theme.spacing(4),
  },
});

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
    flexGrow: 1,
  },
  buttonConnect: {
    marginLeft: theme.spacing(2),
    whiteSpace: 'nowrap',
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
  t,
}) {
  const classes = useStyles();

  const handleBurgerClick = useCallback(() => {
    dispatch(layoutBurgerClicked());
  }, [dispatch]);

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
            <Toolbar>
              {burger && <ButtonBurger {...burgerProps} onClick={handleBurgerClick} />}
              <div id={LEFT_PORTAL_ID} className={classes.portal} />
              {/* @FIXME: implement store actions to hide searchbar */}
              {!window.env.PLUGIN && <InputSearchRedirect aria-label={t('nav:search.label')} placeholder={t('nav:search.placeholder')} />}
              <div id={RIGHT_PORTAL_ID} />
              {buttonConnect && <ButtonConnect className={classes.buttonConnect} />}
              {pausePluginButton && <PausePluginButton />}
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
  children: PropTypes.oneOfType([PropTypes.elementType, PropTypes.object]).isRequired,
  history: PropTypes.shape({ goBack: PropTypes.func, push: PropTypes.func }).isRequired,
  location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
  t: PropTypes.func.isRequired,
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
