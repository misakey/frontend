import React, { useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';

import { AVATAR_SIZE, AVATAR_SM_SIZE, LARGE_MULTIPLIER } from '@misakey/ui/constants/sizes';

import dialogIsFullScreen from '@misakey/helpers/dialog/isFullScreen';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Screen from '@misakey/ui/Screen';
import PaperSlope from '@misakey/ui/Paper/Slope';
import Box from '@material-ui/core/Box';

// CONSTANTS
const HALF_LARGE_MULTIPLIER = LARGE_MULTIPLIER / 2;

// HOOKS
const useStyles = makeStyles((theme) => ({
  screenRoot: {
    position: 'relative',
    boxSizing: 'border-box',
  },
  avatar: ({ large }) => ({
    marginBottom: large ? -AVATAR_SIZE * HALF_LARGE_MULTIPLIER : -AVATAR_SIZE / 2,
    [dialogIsFullScreen(theme)]: {
      marginBottom: large ? -AVATAR_SM_SIZE * HALF_LARGE_MULTIPLIER : -AVATAR_SM_SIZE / 2,
    },
    backgroundColor: 'transparent',
    zIndex: theme.zIndex.speedDial,
    '& > .MuiAvatar-root': {
      border: `1px solid ${theme.palette.background.default}`,
      boxShadow: theme.shadows[4],
    },
  }),
  content: {
    isolation: 'isolate',
    position: 'relative',
    [theme.breakpoints.only('xs')]: {
      height: '100%',
    },
  },
  toolbarFallback: theme.mixins.toolbar,
}));

// COMPONENTS
const ScreenSlope = forwardRef(({
  component: Component,
  children, classes,
  avatar, avatarLarge, header,
  slopeProps,
  ...props
}, ref) => {
  const internalClasses = useStyles({ large: avatarLarge });

  const rootClasses = useMemo(
    () => ({
      root: internalClasses.screenRoot,
      ...classes,
    }),
    [internalClasses, classes],
  );

  return (
    <Component
      ref={ref}
      classes={rootClasses}
      {...props}
    >
      <PaperSlope {...slopeProps} />
      {header || ( // when no header, use a box for similar spacing
        <Box className={internalClasses.toolbarFallback} />
      )}
      <Box
        display="flex"
        flexDirection="column"
        flexGrow="1"
      >
        {avatar && (
          <Box
            display="flex"
            justifyContent="center"
            className={internalClasses.avatar}
          >
            {avatar}
          </Box>
        )}
        <Box className={internalClasses.content}>
          {children}
        </Box>
      </Box>
    </Component>
  );
});

ScreenSlope.propTypes = {
  component: PropTypes.elementType,
  children: PropTypes.node,
  classes: PropTypes.object,
  header: PropTypes.node,
  avatar: PropTypes.node,
  avatarLarge: PropTypes.bool,
  slopeProps: PropTypes.object,
};

ScreenSlope.defaultProps = {
  component: Screen,
  children: null,
  classes: {},
  header: null,
  avatar: null,
  avatarLarge: false,
  slopeProps: {},
};

export default ScreenSlope;
