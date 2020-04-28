import React, { useEffect, useMemo } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import omit from '@misakey/helpers/omit';
import isEmpty from '@misakey/helpers/isEmpty';

import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';

import ErrorIcon from '@material-ui/icons/Error';

import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import AppBar, { APPBAR_HEIGHT } from 'components/dumb/AppBar';
import Footer from 'components/dumb/Footer';
import { IS_PLUGIN } from 'constants/plugin';

// HELPERS
const isError = (error) => error instanceof Error;

// HOOKS
const useBoxStyles = makeStyles({
  root: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
  },
});

// The string representing the message/name is lazily generated
// when the error.message/name property is accessed.
function ScreenError({ error, t }) {
  const classes = useBoxStyles();

  return (
    <Box className={classes.root}>
      <Container maxWidth="md">
        <Box mb={1}>
          {!error.status && <ErrorIcon fontSize="large" color="secondary" />}
          {error.status && <Typography variant="h2" color="secondary">{error.status}</Typography>}
        </Box>
        <Typography variant="h5" component="h3" color="textSecondary">
          {t([
            `common:${error.name}.${error.message}`,
            `common:httpStatus.error.${error.status}`,
            'common:httpStatus.error.default',
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

const ScreenErrorWithTranslation = withTranslation('common')(ScreenError);
export { ScreenErrorWithTranslation as ScreenError };

export const SCREEN_STATES = {
  IS_INITIATING: Symbol('IS_INITIATING'),
  HAS_ERROR: Symbol('HAS_ERROR'),
  OK: Symbol('OK'),
};

function StateWrapper({
  children, error, isLoading, splashScreenText, preventSplashScreen, splashScreen,
}) {
  const currentState = useMemo(() => {
    if (isLoading && !preventSplashScreen) { return SCREEN_STATES.IS_INITIATING; }
    if (isError(error)) { return SCREEN_STATES.HAS_ERROR; }

    return SCREEN_STATES.OK;
  }, [error, isLoading, preventSplashScreen]);

  switch (currentState) {
    case SCREEN_STATES.IS_INITIATING:
      return splashScreen || <SplashScreen text={splashScreenText} />;
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
  splashScreenText: PropTypes.string,
};

StateWrapper.defaultProps = {
  error: null,
  isLoading: false,
  metas: {},
  preventSplashScreen: false,
  splashScreen: null,
  splashScreenText: null,
};

const GUTTERS_SPACING = IS_PLUGIN ? 0 : 3;

export const getStyleForContainerScroll = (
  theme,
  extraFixedSize = 0,
) => ({
  height: `calc(100vh - ${APPBAR_HEIGHT}px - ${theme.spacing(GUTTERS_SPACING)}px - ${extraFixedSize}px)`,
  overflowY: 'auto',
});

const useScreenStyles = makeStyles((theme) => ({
  root: ({ hideAppBar }) => ({
    width: '100%',
    minHeight: `calc(100vh - ${hideAppBar ? 0 : APPBAR_HEIGHT}px - ${theme.spacing(GUTTERS_SPACING)}px)`,
    paddingTop: `calc(${hideAppBar ? 0 : APPBAR_HEIGHT}px + ${theme.spacing(GUTTERS_SPACING)}px)`,
    paddingBottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  }),

  progress: {
    position: 'fixed',
    width: '100%',
    top: 0,
    zIndex: theme.zIndex.tooltip,
  },
  content: ({ disableGrow }) => ({
    flexGrow: disableGrow ? undefined : 1,
    display: 'flex',
    flexDirection: 'column',
  }),
  footer: {
    borderLeft: 'none',
    borderRight: 'none',
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

function Screen({
  appBarProps,
  footerProps,
  children,
  className,
  description,
  hideAppBar,
  hideFooter,
  preventSplashScreen,
  splashScreen,
  state,
  title,
  disableGrow,
  ...rest
}) {
  const hasError = useMemo(
    () => isError(state.error),
    [state],
  );

  // FORCE showing appbar in case of error state
  const hideAppBarExError = useMemo(
    () => (hasError
      ? false
      : hideAppBar),
    [hasError, hideAppBar],
  );

  // FORCE appbar props in case of error state
  const appBarPropsExError = useMemo(
    () => {
      const forcedAppBarProps = hideAppBar
        ? { withSearchBar: false, withUser: false } // hide initially unexpected elements
        : {};
      return (hasError
        ? {
          ...appBarProps,
          ...forcedAppBarProps,
          withHomeLink: true, // always display home link to allow easy leave of error screen
        }
        : appBarProps);
    },
    [appBarProps, hasError, hideAppBar],
  );

  const classes = useScreenStyles({ hideAppBar: hideAppBarExError, disableGrow });

  const footerPropsWithContainerProps = useMemo(
    () => ({
      containerProps: {
        maxWidth: 'md',
      },
      className: classes.footer,
      square: true,
      ...footerProps,
    }),
    [classes.footer, footerProps],
  );


  const isLoading = useMemo(
    () => state.isLoading || state.isFetching,
    [state.isLoading, state.isFetching],
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
      {!hideAppBarExError && (
        <AppBar
          {...appBarPropsExError}
        />
      )}
      <Box
        component="div"
        className={clsx(classes.root, className)}
        {...omit(rest, ['staticContext', 'match'])}
      >
        <StateWrapper
          splashScreen={splashScreen}
          preventSplashScreen={preventSplashScreen}
          {...state}
          isLoading={isLoading}
        >
          <div className={classes.content}>
            {children}
          </div>
        </StateWrapper>
        { !hideFooter && (
          <Box mt={2}>
            <Footer ContainerComponent={Container} {...footerPropsWithContainerProps} />
          </Box>
        ) }
      </Box>
    </>
  );
}

export const SCREEN_STATE_PROPTYPES = PropTypes.shape({
  error: PropTypes.instanceOf(Error),
  isFetching: PropTypes.bool,
  isLoading: PropTypes.bool,
  metas: PropTypes.objectOf(PropTypes.any),
});

Screen.propTypes = {
  appBarProps: PropTypes.objectOf(PropTypes.any),
  footerProps: PropTypes.object,
  children: PropTypes.node,
  className: PropTypes.string,
  description: PropTypes.string,
  hideAppBar: PropTypes.bool,
  hideFooter: PropTypes.bool,
  preventSplashScreen: PropTypes.bool,
  splashScreen: PropTypes.node,
  state: SCREEN_STATE_PROPTYPES,
  title: PropTypes.string,
  disableGrow: PropTypes.bool,
};

Screen.defaultProps = {
  appBarProps: { items: [] },
  footerProps: {},
  children: null,
  className: '',
  description: '',
  hideAppBar: false,
  hideFooter: IS_PLUGIN,
  preventSplashScreen: false,
  splashScreen: null,
  state: {},
  title: '',
  disableGrow: false,
};

export default Screen;
