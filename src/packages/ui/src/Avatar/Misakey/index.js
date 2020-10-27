import React from 'react';
import PropTypes from 'prop-types';

import { AVATAR_SIZE, AVATAR_SM_SIZE } from '@misakey/ui/constants/sizes';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Logo from '@misakey/ui/Logo';
import Avatar, { LARGE_AVATAR_SIZE, LARGE_AVATAR_SM_SIZE } from '@misakey/ui/Avatar';

// HOOKS
const useStyles = makeStyles((theme) => ({
  logoRoot: ({ large }) => ({
    height: large ? LARGE_AVATAR_SIZE : AVATAR_SIZE,
    width: large ? LARGE_AVATAR_SIZE : AVATAR_SIZE,
    [theme.breakpoints.down('sm')]: {
      height: large ? LARGE_AVATAR_SM_SIZE : AVATAR_SM_SIZE,
      width: large ? LARGE_AVATAR_SM_SIZE : AVATAR_SM_SIZE,
    },
  }),
}));

// COMPONENTS
const AvatarMisakey = ({ large, ...props }) => {
  const internalClasses = useStyles({ large });
  return (
    <Avatar
      alt="Misakey"
      large={large}
      {...props}
    >
      <Logo short className={internalClasses.logoRoot} />
    </Avatar>
  );
};

AvatarMisakey.propTypes = {
  large: PropTypes.bool,
};

AvatarMisakey.defaultProps = {
  large: false,
};

export default AvatarMisakey;
