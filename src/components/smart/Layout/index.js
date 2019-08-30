import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import clsx from 'clsx';

import { fade, makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import CssBaseline from '@material-ui/core/CssBaseline';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';

import ElevationScroll from 'components/dumb/ElevationScroll';
import ButtonConnect from 'components/dumb/Button/Connect';

import { DRAWER_WIDTH } from 'components/screen/Service/Drawer';
import ButtonGoBack from 'components/dumb/Button/GoBack';
import ButtonBurger from 'components/dumb/Button/Burger';
import { layoutBurgerClicked } from 'store/actions/Layout';

export const LEFT_PORTAL_ID = 'LayoutLeftPortal';
export const RIGHT_PORTAL_ID = 'LayoutRightPortal';

export const NAV_HEIGHT = 64;

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
  content: {
    position: 'relative',
    flexGrow: 1,
    width: '100%',
    minHeight: '100vh',
    paddingTop: NAV_HEIGHT,
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

function Layout({
  burger,
  burgerProps,
  buttonConnect,
  children,
  dispatch,
  goBack,
  history,
  shift,
  t,
}) {
  const classes = useStyles();

  const handleBurgerClick = React.useCallback(() => {
    dispatch(layoutBurgerClicked());
  }, [dispatch]);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <ElevationScroll>
        <AppBar
          position="fixed"
          color="inherit"
          elevation={0}
          className={clsx(classes.appBar, { [classes.appBarShift]: shift })}
        >
          <Toolbar>
            {burger && <ButtonBurger {...burgerProps} onClick={handleBurgerClick} />}
            {(goBack && !burger) && <ButtonGoBack history={history} />}
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
            {buttonConnect && <ButtonConnect className={classes.buttonConnect} />}
          </Toolbar>
        </AppBar>
      </ElevationScroll>
      <main className={classes.content}>
        {children}
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
  goBack: PropTypes.bool,
  shift: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.elementType, PropTypes.object]).isRequired,
  history: PropTypes.shape({ goBack: PropTypes.func, push: PropTypes.func }).isRequired,
  t: PropTypes.func.isRequired,
};

Layout.defaultProps = {
  burger: false,
  burgerProps: { className: '' },
  buttonConnect: true,
  goBack: true,
  shift: false,
};

export default connect(
  state => ({ ...state.Layout }),
)(withRouter(withTranslation('nav')(Layout)));
