import React from 'react';

import Skeleton from '@material-ui/lab/Skeleton';

const AvatarUserSkeleton = (props) => (
  <Skeleton variant="circle" width={40} height={40} {...props} />
);

export default AvatarUserSkeleton;
