import React from 'react';
import PropTypes from 'prop-types';

import { useLayoutStyles } from '@misakey/ui/Avatar/Detailed';
import makeStyles from '@material-ui/core/styles/makeStyles';

import AvatarSkeleton from '@misakey/ui/Avatar/Skeleton';
import { LARGE } from '@misakey/ui/constants/sizes';
import Skeleton from '@material-ui/lab/Skeleton';
import Title from '@misakey/ui/Typography/Title';
import Subtitle from '@misakey/ui/Typography/Subtitle';
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
      {title && <Title gutterBottom={false} className={classes.fullWidth} variant="h6"><Skeleton variant="text" /></Title>}
      {subtitle && <Subtitle gutterBottom={false} className={classes.fullWidth}><Skeleton variant="text" /></Subtitle>}
    </Box>
  );
};

AvatarDetailedSkeleton.propTypes = {
  title: PropTypes.bool,
  subtitle: PropTypes.bool,
};

AvatarDetailedSkeleton.defaultProps = {
  title: false,
  subtitle: false,
};

export default AvatarDetailedSkeleton;
