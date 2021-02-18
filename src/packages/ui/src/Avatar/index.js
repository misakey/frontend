import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import {
  SMALL, MEDIUM, LARGE, SIZES,
  AVATAR_SIZE, AVATAR_SM_SIZE,
  LARGE_MULTIPLIER, SMALL_MULTIPLIER,
  LARGE_AVATAR_SIZE, LARGE_AVATAR_SM_SIZE,
  SMALL_AVATAR_SIZE, SMALL_AVATAR_SM_SIZE,
} from '@misakey/ui/constants/sizes';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import Avatar from '@material-ui/core/Avatar';

// CONSTANTS
export const FONT_SIZE_PX = 12;

// HOOKS
export const useStyles = makeStyles((theme) => ({
  avatarRoot: ({ size }) => {
    const notSizedProps = {
      textTransform: 'uppercase',
      textDecoration: 'none',
    };

    if (size === LARGE) {
      return {
        ...notSizedProps,
        height: LARGE_AVATAR_SIZE,
        width: LARGE_AVATAR_SIZE,
        [theme.breakpoints.down('sm')]: {
          height: LARGE_AVATAR_SM_SIZE,
          width: LARGE_AVATAR_SM_SIZE,
        },
        fontSize: theme.typography.pxToRem(LARGE_MULTIPLIER * FONT_SIZE_PX),
      };
    }

    if (size === SMALL) {
      return {
        ...notSizedProps,
        height: SMALL_AVATAR_SIZE,
        width: SMALL_AVATAR_SIZE,
        [theme.breakpoints.down('sm')]: {
          height: SMALL_AVATAR_SM_SIZE,
          width: SMALL_AVATAR_SM_SIZE,
        },
        fontSize: theme.typography.pxToRem(FONT_SIZE_PX * SMALL_MULTIPLIER),
      };
    }

    return {
      ...notSizedProps,
      height: AVATAR_SIZE,
      width: AVATAR_SIZE,
      [theme.breakpoints.down('sm')]: {
        height: AVATAR_SM_SIZE,
        width: AVATAR_SM_SIZE,
      },
      fontSize: theme.typography.pxToRem(FONT_SIZE_PX),
    };
  },
}));

// COMPONENTS
const AvatarSized = ({ classes, size, children, ...props }) => {
  const internalClasses = useStyles({ size });
  const { root, ...rest } = useSafeDestr(classes);
  return (
    <Avatar
      classes={{ root: clsx(root, internalClasses.avatarRoot), ...rest }}
      {...props}
    >
      {children}
    </Avatar>
  );
};

AvatarSized.propTypes = {
  size: PropTypes.oneOf(SIZES),
  children: PropTypes.node,
  classes: PropTypes.shape({
    root: PropTypes.string,
  }),
};

AvatarSized.defaultProps = {
  size: MEDIUM,
  children: null,
  classes: {},
};

export default AvatarSized;
