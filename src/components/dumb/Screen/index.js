import React, { useEffect, useMemo } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import omit from '@misakey/helpers/omit';
import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';

import ErrorIcon from '@material-ui/icons/Error';

import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import { FOOTER_HEIGHT } from 'components/dumb/Footer';
import FooterFullScreen from 'components/dumb/Footer/FullScreen';

// CONSTANTS
// footer height + margintop
export const FOOTER_SPACE = FOOTER_HEIGHT + 16;

// HELPERS
const isError = (error) => error instanceof Error;

// HOOKS
const useBoxStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
    backgroundColor: theme.palette.background.default,
  },
}));

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

const GUTTERS_SPACING = 3;

const useScreenStyles = makeStyles((theme) => ({
  root: () => ({
    width: '100%',
    minHeight: `calc(100vh - ${theme.spacing(GUTTERS_SPACING)}px)`,
    paddingTop: theme.spacing(GUTTERS_SPACING),
    paddingBottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: theme.palette.background.default,
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
}));

/**
 * This function has no effect on SEO but just improves UX.
 * @param title
 * @param description
 */
function updateHead(title, description) {
  if (!isEmpty(title) && !isNil(title)) { document.title = title; }
  if (!isEmpty(description) && !isNil(title)) { document.description = description; }

  return () => {
    document.title = 'Misakey';
    document.description = '';
  };
}

function Screen({
  children,
  className,
  classes,
  description,
  preventSplashScreen,
  splashScreen,
  state,
  title,
  disableGrow,
  ...rest
}) {
  const internalClasses = useScreenStyles({ disableGrow });

  const isLoading = useMemo(
    () => state.isLoading || state.isFetching,
    [state.isLoading, state.isFetching],
  );

  useEffect(() => updateHead(title, description), [description, title]);

  return (
    <>
      {isLoading && (
        <LinearProgress
          className={internalClasses.progress}
          color="secondary"
          variant="query"
        />
      )}
      <Box
        component="div"
        className={clsx(internalClasses.root, className)}
        {...omit(rest, ['staticContext', 'match'])}
      >
        <StateWrapper
          splashScreen={splashScreen}
          preventSplashScreen={preventSplashScreen}
          {...state}
          isLoading={isLoading}
        >
          <div className={clsx(internalClasses.content, classes.content)}>
            {children}
          </div>
        </StateWrapper>
      </Box>
      <FooterFullScreen />
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
  children: PropTypes.node,
  className: PropTypes.string,
  classes: PropTypes.shape({
    content: PropTypes.string,
    footer: PropTypes.string,
  }),
  description: PropTypes.string,
  preventSplashScreen: PropTypes.bool,
  splashScreen: PropTypes.node,
  state: SCREEN_STATE_PROPTYPES,
  title: PropTypes.string,
  disableGrow: PropTypes.bool,
};

Screen.defaultProps = {
  children: null,
  className: '',
  classes: {
    content: '',
  },
  description: '',
  preventSplashScreen: false,
  splashScreen: null,
  state: {},
  title: null,
  disableGrow: false,
};

export default Screen;
