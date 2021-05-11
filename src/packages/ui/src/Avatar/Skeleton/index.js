import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

import { useStyles } from '@misakey/ui/Avatar';
import { SIZES, MEDIUM } from '@misakey/ui/constants/sizes';

import Skeleton from '@material-ui/lab/Skeleton';

// COMPONENTS
const AvatarSkeleton = forwardRef(({ size, classes, ...props }, ref) => {
  const internalClasses = useStyles({ size });
  return (
    <Skeleton
      ref={ref}
      variant="circle"
      className={internalClasses.avatarRoot}
      classes={classes}
      {...props}
    />
  );
});

AvatarSkeleton.propTypes = {
  size: PropTypes.oneOf(SIZES),
  classes: PropTypes.object,
};

AvatarSkeleton.defaultProps = {
  size: MEDIUM,
  classes: {},
};

export default AvatarSkeleton;
