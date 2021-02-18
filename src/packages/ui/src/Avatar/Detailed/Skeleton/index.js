import React from 'react';
import PropTypes from 'prop-types';

import { useLayoutStyles } from '@misakey/ui/Avatar/Detailed';
import makeStyles from '@material-ui/core/styles/makeStyles';

import AvatarSkeleton from '@misakey/ui/Avatar/Skeleton';
import { LARGE } from '@misakey/ui/constants/sizes';
import Skeleton from '@material-ui/lab/Skeleton';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

// HOOKS
const useStyles = makeStyles(() => ({
  fullWidth: {
    width: '100%',
  },
}));

// COMPONENTS
const AvatarDetailedSkeleton = ({ title, subtitle }) => {
  const layoutClasses = useLayoutStyles();
  const classes = useStyles();
  return (
    <Box className={layoutClasses.root}>
      <AvatarSkeleton size={LARGE} classes={{ root: layoutClasses.avatar }} />
      {title && <Typography className={classes.fullWidth} variant="h6"><Skeleton variant="text" /></Typography>}
      {subtitle && <Typography className={classes.fullWidth} variant="body2"><Skeleton variant="text" /></Typography>}
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
