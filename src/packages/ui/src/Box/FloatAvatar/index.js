import React from 'react';
import PropTypes from 'prop-types';

import { AVATAR_SIZE, AVATAR_SM_SIZE } from '@misakey/ui/constants/sizes';
import {
  SMALL_AVATAR_SIZE, SMALL_AVATAR_SM_SIZE,
  LARGE_AVATAR_SIZE, LARGE_AVATAR_SM_SIZE,
  SIZES, MEDIUM, LARGE, SMALL,
} from '@misakey/ui/Avatar';

import dialogIsFullScreen from '@misakey/helpers/dialog/isFullScreen';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';

// CONSTANTS
export const TOP = 'top';
export const BOTTOM = 'bottom';
export const DIRECTIONS = [TOP, BOTTOM];

// HOOKS
const useStyles = makeStyles((theme) => ({
  boxRoot: ({ size, direction }) => {
    const marginKey = direction === TOP ? 'marginTop' : 'marginBottom';
    const notSizedProps = {
      backgroundColor: 'transparent',
      zIndex: theme.zIndex.speedDial,
      '& > .MuiAvatar-root': {
        border: `1px solid ${theme.palette.background.default}`,
        boxShadow: theme.shadows[4],
      },
    };
    if (size === LARGE) {
      return {
        ...notSizedProps,
        [marginKey]: -LARGE_AVATAR_SIZE / 2,
        [dialogIsFullScreen(theme)]: {
          [marginKey]: -LARGE_AVATAR_SM_SIZE / 2,
        },
      };
    }
    if (size === SMALL) {
      return {
        ...notSizedProps,
        [marginKey]: -SMALL_AVATAR_SIZE / 2,
        [dialogIsFullScreen(theme)]: {
          [marginKey]: -SMALL_AVATAR_SM_SIZE / 2,
        },
      };
    }
    return {
      ...notSizedProps,
      [marginKey]: -AVATAR_SIZE / 2,
      [dialogIsFullScreen(theme)]: {
        [marginKey]: -AVATAR_SM_SIZE / 2,
      },
    };
  },
}));

// COMPONENTS
const BoxFloatAvatar = ({ size, direction, children, ...props }) => {
  const classes = useStyles({ size, direction });

  return (
    <Box
      display="flex"
      justifyContent="center"
      className={classes.boxRoot}
      {...props}
    >
      {children}
    </Box>
  );
};

BoxFloatAvatar.propTypes = {
  size: PropTypes.oneOf(SIZES),
  direction: PropTypes.oneOf(DIRECTIONS),
  children: PropTypes.node,
};

BoxFloatAvatar.defaultProps = {
  size: MEDIUM,
  direction: BOTTOM,
  children: null,
};

export default BoxFloatAvatar;
