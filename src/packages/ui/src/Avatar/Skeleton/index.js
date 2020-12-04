import PropTypes from 'prop-types';

import { AVATAR_SIZE, AVATAR_SM_SIZE } from '@misakey/ui/constants/sizes';
import { LARGE_AVATAR_SIZE, LARGE_AVATAR_SM_SIZE } from '@misakey/ui/Avatar';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Skeleton from '@material-ui/lab/Skeleton';

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatarRoot: ({ large }) => ({
    height: large ? LARGE_AVATAR_SIZE : AVATAR_SIZE,
    width: large ? LARGE_AVATAR_SIZE : AVATAR_SIZE,
    [theme.breakpoints.down('sm')]: {
      height: large ? LARGE_AVATAR_SM_SIZE : AVATAR_SM_SIZE,
      width: large ? LARGE_AVATAR_SM_SIZE : AVATAR_SM_SIZE,
    },
  }),
}));

// COMPONENTS
const AvatarSkeleton = ({ large, classes, ...props }) => {
  const internalClasses = useStyles({ large });
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
  large: PropTypes.bool,
  classes: PropTypes.object,
};

AvatarSkeleton.defaultProps = {
  large: false,
  classes: {},
};

export default AvatarSkeleton;
