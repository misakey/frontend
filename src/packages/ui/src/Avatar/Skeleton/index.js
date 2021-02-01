import React from 'react';
import PropTypes from 'prop-types';

import { useStyles, SIZES, MEDIUM } from '@misakey/ui/Avatar';

import Skeleton from '@material-ui/lab/Skeleton';

// COMPONENTS
const AvatarSkeleton = ({ size, classes, ...props }) => {
  const internalClasses = useStyles({ size });
  return (
    <Skeleton
      variant="circle"
      className={internalClasses.avatarRoot}
      classes={classes}
      {...props}
    />
  );
};

AvatarSkeleton.propTypes = {
  size: PropTypes.oneOf(SIZES),
  classes: PropTypes.object,
};

AvatarSkeleton.defaultProps = {
  size: MEDIUM,
  classes: {},
};

export default AvatarSkeleton;
