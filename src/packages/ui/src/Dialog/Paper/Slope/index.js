import { forwardRef } from 'react';
import PropTypes from 'prop-types';

import { AVATAR_SIZE, AVATAR_SM_SIZE, LARGE_MULTIPLIER } from '@misakey/ui/constants/sizes';

import dialogIsFullScreen from '@misakey/helpers/dialog/isFullScreen';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import PaperSlope from '@misakey/ui/Paper/Slope';

// CONSTANTS
const HALF_LARGE_MULTIPLIER = LARGE_MULTIPLIER / 2;

// HOOKS
const useStyles = makeStyles((theme) => ({
  paperRoot: {
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
    position: 'relative',
    isolation: 'isolate',
    [dialogIsFullScreen(theme)]: {
      height: '100%',
    },
  },
}));

// COMPONENTS
const DialogPaperSlope = forwardRef(({ avatar, avatarLarge, header, children, ...props }, ref) => {
  const classes = useStyles({ large: avatarLarge });
  return (
    <Paper
      ref={ref}
      classes={{ root: classes.paperRoot }}
      {...props}
    >
      <PaperSlope />
      {header}
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
            className={classes.avatar}
          >
            {avatar}
          </Box>
        )}
        <Box className={classes.content}>
          {children}
        </Box>
      </Box>
    </Paper>
  );
});

DialogPaperSlope.propTypes = {
  children: PropTypes.node,
  header: PropTypes.node,
  avatar: PropTypes.node,
  avatarLarge: PropTypes.bool,
};

DialogPaperSlope.defaultProps = {
  children: null,
  header: null,
  avatar: null,
  avatarLarge: false,
};

export default DialogPaperSlope;
