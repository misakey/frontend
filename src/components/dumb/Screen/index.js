import React, { useEffect, useMemo } from 'react';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import noop from '@misakey/helpers/noop';
import omit from '@misakey/helpers/omit';
import isEmpty from '@misakey/helpers/isEmpty';
import debounce from '@misakey/helpers/debounce';
import getSearchParams from '@misakey/helpers/getSearchParams';
import objectToQueryString from '@misakey/helpers/objectToQueryString';

import { makeStyles } from '@material-ui/core/styles';
import { MIN_PX_0_LANDSCAPE, MIN_PX_600 } from 'constants/ui/medias';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';

import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import ErrorIcon from '@material-ui/icons/Error';

import AppBar from 'components/dumb/AppBar';
import { PLUGIN_HEIGHT, PLUGIN_WIDTH } from 'constants/ui/sizes';
import { isDesktopDevice } from 'helpers/devices';

const useBoxStyles = makeStyles({
  root: { height: '100%' },
});

const BOX_PROPS = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'center',
};

function DefaultSplashScreen({ t }) {
  const classes = useBoxStyles();

  return (
    <Box className={classes.root} {...BOX_PROPS}>
      <Container maxWidth="md">
        <Box mb={1}>
          <HourglassEmptyIcon fontSize="large" color="secondary" />
        </Box>
        <Typography variant="h5" component="h3" color="textSecondary">
          {t('loading')}
        </Typography>
      </Container>
    </Box>
  );
}

DefaultSplashScreen.propTypes = {
  t: PropTypes.func.isRequired,
};

const DefaultSplashScreenWithTranslation = withTranslation()(DefaultSplashScreen);

// The string representing the message/name is lazily generated
// when the error.message/name property is accessed.
function ScreenError({ error, t }) {
  const classes = useBoxStyles();

  return (
    <Box className={classes.root} {...BOX_PROPS}>
      <Container maxWidth="md">
        <Box mb={1}>
          {!error.status && <ErrorIcon fontSize="large" color="secondary" />}
          {error.status && <Typography variant="h2" color="secondary">{error.status}</Typography>}
        </Box>
        <Typography variant="h5" component="h3" color="textSecondary">
          {t([
            `${error.name}.${error.message}`,
            `httpStatus.error.${error.status}`,
            'httpStatus.error.default',
          ])}
        </Typography>
      </Container>
    </Box>
  );
}

ScreenError.propTypes = {
  error: PropTypes.shape({
    message: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.number,
  }).isRequired,
  t: PropTypes.func.isRequired,
};

const ScreenErrorWithTranslation = withTranslation()(ScreenError);

export const SCREEN_STATES = {
  IS_INITIATING: Symbol('IS_INITIATING'),
  HAS_ERROR: Symbol('HAS_ERROR'),
  OK: Symbol('OK'),
};

function StateWrapper({ children, error, isLoading, preventSplashScreen, splashScreen }) {
  const currentState = useMemo(() => {
    if (isLoading && !preventSplashScreen) { return SCREEN_STATES.IS_INITIATING; }
    if (error instanceof Error) { return SCREEN_STATES.HAS_ERROR; }

    return SCREEN_STATES.OK;
  }, [error, isLoading, preventSplashScreen]);

  switch (currentState) {
    case SCREEN_STATES.IS_INITIATING:
      return splashScreen || <DefaultSplashScreenWithTranslation />;
    case SCREEN_STATES.HAS_ERROR:
      return <ScreenErrorWithTranslation error={error} />;
    default:
      return children;
  }
}

StateWrapper.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]).isRequired,
  error: PropTypes.instanceOf(Error),
  isLoading: PropTypes.bool,
  metas: PropTypes.objectOf(PropTypes.any),
  preventSplashScreen: PropTypes.bool,
  splashScreen: PropTypes.node,
};

StateWrapper.defaultProps = {
  error: null,
  isLoading: false,
  metas: {},
  preventSplashScreen: false,
  splashScreen: null,
};

function getRootStyle(theme, options = {}, hideAppBar = false) {
  const { media, gutters = false, fixedHeight = false } = options;

  const spacing = theme.spacing(gutters ? 3 : 0);
  const toolbar = theme.mixins.toolbar[media] || theme.mixins.toolbar;

  const isPopupPlugin = window.env.PLUGIN && isDesktopDevice();

  if (isPopupPlugin) {
    const appBarHeight = 56;
    return {
      height: hideAppBar ? PLUGIN_HEIGHT + appBarHeight : PLUGIN_HEIGHT,
      width: PLUGIN_WIDTH,
      marginTop: hideAppBar ? 0 : appBarHeight,
      overflowY: 'auto',
    };
  }

  const height = '100vh';
  const minWidth = '100%';
  const minHeight = `calc(${height} - ${hideAppBar ? 0 : toolbar.minHeight}px - ${2 * spacing}px)`;
  const paddingTop = `calc(${hideAppBar ? 0 : toolbar.minHeight}px + ${spacing}px)`;

  return {
    minWidth,
    minHeight,
    height: fixedHeight ? minHeight : 'auto',
    width: '100%',
    paddingTop,
    paddingBottom: spacing,
  };
}

const useScreenStyles = makeStyles((theme) => ({
  /* ROOT SCREEN SIZES */
  root: ({ hideAppBar }) => ({
    [MIN_PX_0_LANDSCAPE]: getRootStyle(theme, { media: MIN_PX_0_LANDSCAPE }, hideAppBar),
    [MIN_PX_600]: getRootStyle(theme, { media: MIN_PX_600 }, hideAppBar),
    ...getRootStyle(theme, {}, hideAppBar),
  }),
  gutters: ({ hideAppBar }) => ({
    [MIN_PX_0_LANDSCAPE]: getRootStyle(
      theme,
      { media: MIN_PX_0_LANDSCAPE, gutters: true },
      hideAppBar,
    ),
    [MIN_PX_600]: getRootStyle(theme, { media: MIN_PX_600, gutters: true }, hideAppBar),
    ...getRootStyle(theme, { gutters: true }, hideAppBar),
  }),
  fixedHeight: ({ hideAppBar }) => ({
    [MIN_PX_0_LANDSCAPE]: getRootStyle(
      theme,
      { media: MIN_PX_0_LANDSCAPE, fixedHeight: true },
      hideAppBar,
    ),
    [MIN_PX_600]: getRootStyle(theme, { media: MIN_PX_600, fixedHeight: true }, hideAppBar),
    ...getRootStyle(theme, { fixedHeight: true }, hideAppBar),
    display: 'flex',
    flexDirection: 'column',
  }),
  /* END OF ROOT SCREEN SIZES */

  progress: {
    position: 'fixed',
    width: '100%',
    top: 0,
    zIndex: theme.zIndex.tooltip,
  },
}));

/**
 * This function has no effect on SEO but just improves UX.
 * @param title
 * @param description
 */
function updateHead(title, description) {
  if (!isEmpty(title)) { document.title = title; }
  if (!isEmpty(description)) { document.description = description; }

  return () => {
    document.title = 'Misakey';
    document.description = '';
  };
}

function updateSearchParams(value, history, search, pathname) {
  const searchParams = getSearchParams(search);
  const newParams = { ...searchParams, search: value };

  if (isEmpty(newParams.search)) { delete newParams.search; }

  const query = objectToQueryString(newParams);

  history.replace(`${pathname}?${query}`);
}

function Screen({
  appBarProps,
  children,
  className,
  description,
  disableGutters,
  fullHeight,
  hideAppBar,
  history,
  location: { search, pathname },
  preventSplashScreen,
  splashScreen,
  state,
  title,
  ...rest
}) {
  const classes = useScreenStyles({ hideAppBar });

  const isLoading = useMemo(
    () => state.isLoading || state.isFetching,
    [state.isLoading, state.isFetching],
  );

  const initialSearchBarValue = useMemo(
    () => getSearchParams(search).search,
    [search],
  );

  const handleSearchBarChange = useMemo(
    () => debounce((value) => {
      updateSearchParams(value, history, search, pathname);
    }, 200),
    [history, search, pathname],
  );

  useEffect(() => updateHead(title, description), [description, title]);

  return (
    <>
      {isLoading && (
        <LinearProgress
          className={classes.progress}
          color="secondary"
          variant="query"
        />
      )}
      {!hideAppBar && (
        <AppBar
          {...appBarProps}
          searchBarProps={{
            autoFocus: !isEmpty(initialSearchBarValue),
            initialValue: initialSearchBarValue,
            onChange: handleSearchBarChange,
            ...appBarProps.searchBarProps,
          }}
        />
      )}
      <Box
        component="main"
        className={clsx(classes.root, className, {
          [classes.gutters]: !disableGutters,
          [classes.fullHeight]: fullHeight,
        })}
        {...omit(rest, ['staticContext'])}
      >
        <StateWrapper
          splashScreen={splashScreen}
          preventSplashScreen={preventSplashScreen}
          {...state}
          isLoading={isLoading}
        >
          {children}
        </StateWrapper>
      </Box>
    </>
  );
}

Screen.propTypes = {
  appBarProps: PropTypes.objectOf(PropTypes.any),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  description: PropTypes.string,
  disableGutters: PropTypes.bool,
  fullHeight: PropTypes.bool,
  hideAppBar: PropTypes.bool,
  history: PropTypes.shape({ replace: PropTypes.func }),
  location: PropTypes.shape({ search: PropTypes.string, pathname: PropTypes.string }),
  preventSplashScreen: PropTypes.bool,
  splashScreen: PropTypes.node,
  state: PropTypes.shape({
    error: PropTypes.instanceOf(Error),
    isFetching: PropTypes.bool,
    isLoading: PropTypes.bool,
    metas: PropTypes.objectOf(PropTypes.any),
  }),
  title: PropTypes.string,
};

Screen.defaultProps = {
  appBarProps: { items: [] },
  className: '',
  description: '',
  disableGutters: false,
  fullHeight: false,
  hideAppBar: false,
  history: { replace: noop },
  location: { search: '', pathname: '' },
  preventSplashScreen: false,
  splashScreen: null,
  state: {},
  title: '',
};

export default withRouter(Screen);
