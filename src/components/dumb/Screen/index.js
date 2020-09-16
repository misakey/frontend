import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import omit from '@misakey/helpers/omit';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import LinearProgress from '@material-ui/core/LinearProgress';

import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import FooterFullScreen from '@misakey/ui/Footer/FullScreen';

// CONSTANTS
const GUTTERS_SPACING = 3;

const useScreenStyles = makeStyles((theme) => ({
  root: ({
    width: '100%',
    minHeight: `calc(100% - ${theme.spacing(GUTTERS_SPACING)}px)`,
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
  content: ({
    display: 'flex',
    flexDirection: 'column',
  }),
}));


function Screen({
  children,
  className,
  classes,
  description,
  preventSplashScreen,
  isLoading,
  title,
  ...rest
}) {
  const internalClasses = useScreenStyles();

  useUpdateDocHead(title, description);

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
        {isLoading && !preventSplashScreen && (
          <SplashScreen />
        )}
        {!isLoading && (
          <div className={clsx(internalClasses.content, classes.content)}>
            {children}
          </div>
        )}
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
  isLoading: PropTypes.bool,
  splashScreen: PropTypes.node,
  title: PropTypes.string,
};

Screen.defaultProps = {
  children: null,
  className: '',
  classes: {
    content: '',
  },
  description: '',
  preventSplashScreen: false,
  isLoading: false,
  splashScreen: null,
  title: null,
};

export default Screen;
