import PropTypes from 'prop-types';

import { AVATAR_SIZE, AVATAR_SM_SIZE, LARGE_MULTIPLIER } from '@misakey/ui/constants/sizes';

import dialogIsFullScreen from '@misakey/helpers/dialog/isFullScreen';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { useMemo } from 'react';

import Screen from '@misakey/ui/Screen';
import PaperSlope from '@misakey/ui/Paper/Slope';
import Box from '@material-ui/core/Box';

// CONSTANTS
const HALF_LARGE_MULTIPLIER = LARGE_MULTIPLIER / 2;

// HOOKS
const useStyles = makeStyles((theme) => ({
  screenRoot: {
    position: 'relative',
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
    [dialogIsFullScreen(theme)]: {
      height: '100%',
    },
  },
  toolbarFallback: theme.mixins.toolbar,
}));

// COMPONENTS
const ScreenSlope = ({ children, classes, avatar, avatarLarge, header, ...props }) => {
  const internalClasses = useStyles({ large: avatarLarge });

  const screenClasses = useMemo(
    () => ({
      root: internalClasses.screenRoot,
      ...classes,
    }),
    [internalClasses, classes],
  );

  return (
    <Screen
      classes={screenClasses}
      {...props}
    >
      <PaperSlope />
      {header || ( // when no header, use a box for similar spacing
        <Box className={internalClasses.toolbarFallback} />
      )}
      <Box
        display="flex"
        flexDirection="column"
        flexGrow="1"
        justifyContent="center"
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
    </Screen>
  );
};

ScreenSlope.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.object,
  header: PropTypes.node,
  avatar: PropTypes.node,
  avatarLarge: PropTypes.bool,
};

ScreenSlope.defaultProps = {
  children: null,
  classes: {},
  header: null,
  avatar: null,
  avatarLarge: false,
};

export default ScreenSlope;
