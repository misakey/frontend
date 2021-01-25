import React from 'react';
import PropTypes from 'prop-types';

import { AVATAR_SIZE, AVATAR_SM_SIZE, LARGE_MULTIPLIER } from '@misakey/ui/constants/sizes';

import makeStyles from '@material-ui/core/styles/makeStyles';


import Avatar from '@material-ui/core/Avatar';

// CONSTANTS
export const LARGE_AVATAR_SIZE = LARGE_MULTIPLIER * AVATAR_SIZE;
export const LARGE_AVATAR_SM_SIZE = LARGE_MULTIPLIER * AVATAR_SM_SIZE;

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatarRoot: ({ large }) => ({
    height: large ? LARGE_AVATAR_SIZE : AVATAR_SIZE,
    width: large ? LARGE_AVATAR_SIZE : AVATAR_SIZE,
    [theme.breakpoints.down('sm')]: {
      height: large ? LARGE_AVATAR_SM_SIZE : AVATAR_SM_SIZE,
      width: large ? LARGE_AVATAR_SM_SIZE : AVATAR_SM_SIZE,
    },
    fontSize: large ? theme.spacing(LARGE_MULTIPLIER * 1.5) : theme.spacing(1.5),
    textTransform: 'uppercase',
    textDecoration: 'none',
  }),
}));

// COMPONENTS
const AvatarSized = ({ classes, large, children, ...props }) => {
  const internalClasses = useStyles({ large });
  return (
    <Avatar
      className={internalClasses.avatarRoot}
      classes={classes}
      {...props}
    >
      {children}
    </Avatar>
  );
};

AvatarSized.propTypes = {
  large: PropTypes.bool,
  children: PropTypes.node,
  classes: PropTypes.object,
};

AvatarSized.defaultProps = {
  large: false,
  children: null,
  classes: {},
};

export default AvatarSized;
