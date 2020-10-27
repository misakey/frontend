import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import omit from '@misakey/helpers/omit';

import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';
import FooterFullScreen from '@misakey/ui/Footer/FullScreen';
import ScreenLoader from 'components/dumb/Screen/Loader';

// HOOKS
const useScreenStyles = makeStyles((theme) => ({
  root: ({
    width: '100%',
    height: 'inherit',
    paddingBottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: theme.palette.background.default,
  }),
  content: ({
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
  }),
}));

// COMPONENTS
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
      <ScreenLoader isLoading={isLoading} />
      <Box
        component="div"
        className={clsx(internalClasses.root, classes.root, className)}
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
        <FooterFullScreen />
      </Box>
    </>
  );
}

Screen.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  classes: PropTypes.shape({
    content: PropTypes.string,
    root: PropTypes.string,
  }),
  description: PropTypes.string,
  preventSplashScreen: PropTypes.bool,
  isLoading: PropTypes.bool,
  title: PropTypes.string,
};

Screen.defaultProps = {
  children: null,
  className: '',
  classes: {},
  description: '',
  preventSplashScreen: false,
  isLoading: false,
  title: null,
};

export default Screen;
