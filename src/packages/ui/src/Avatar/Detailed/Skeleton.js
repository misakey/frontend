import React from 'react';
import PropTypes from 'prop-types';

import { RADIUS, useLayoutStyles } from '@misakey/ui/Avatar/Detailed';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Skeleton from '@material-ui/lab/Skeleton';
import Box from '@material-ui/core/Box';

// HOOKS
const useStyles = makeStyles((theme) => ({
  title: {
    ...theme.typography.h6,
  },
  subtitle: {
    ...theme.typography.body2,
  },
}));

// COMPONENTS
const AvatarDetailedSkeleton = ({ title, subtitle }) => {
  const layoutClasses = useLayoutStyles();
  const classes = useStyles();
  return (
    <Box className={layoutClasses.root}>
      <Skeleton className={layoutClasses.avatar} variant="circle" width={RADIUS} height={RADIUS} />
      {title && <Skeleton className={classes.title} variant="text" width="100%" />}
      {subtitle && <Skeleton className={classes.subtitle} variant="text" width="100%" />}
    </Box>
  );
};

AvatarDetailedSkeleton.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
};

AvatarDetailedSkeleton.defaultProps = {
  title: null,
  subtitle: null,
};

export default AvatarDetailedSkeleton;
