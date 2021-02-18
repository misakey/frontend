import React from 'react';
import PropTypes from 'prop-types';

import { useStyles as useAvatarStyles } from '@misakey/ui/Avatar';

import { AVATAR_SIZE, AVATAR_SM_SIZE,
  SMALL_AVATAR_SIZE, SMALL_AVATAR_SM_SIZE,
  LARGE_AVATAR_SIZE, LARGE_AVATAR_SM_SIZE,
  LARGE, MEDIUM, SMALL, SIZES,
} from '@misakey/ui/constants/sizes';


import makeStyles from '@material-ui/core/styles/makeStyles';

import AvatarGroup from '@material-ui/lab/AvatarGroup';
import AvatarUser from '@misakey/ui/Avatar/User';

// CONSTANTS
const NEGATIVE_MARGIN = 8;

// HELPERS
const computeMaxWidth = (
  max, avatarSize,
) => max * avatarSize - Math.max(0, max - 1) * NEGATIVE_MARGIN;

// HOOKS
export const getResponsiveMaxWidth = (isDownSm, { size, max }) => {
  if (isDownSm) {
    if (size === LARGE) {
      return computeMaxWidth(max, LARGE_AVATAR_SM_SIZE);
    }
    if (size === SMALL) {
      return computeMaxWidth(max, SMALL_AVATAR_SM_SIZE);
    }
    return computeMaxWidth(max, AVATAR_SM_SIZE);
  }
  if (size === LARGE) {
    return computeMaxWidth(max, LARGE_AVATAR_SIZE);
  }
  if (size === SMALL) {
    return computeMaxWidth(max, SMALL_AVATAR_SIZE);
  }
  return computeMaxWidth(max, AVATAR_SIZE);
};

const useStyles = makeStyles((theme) => ({
  avatarGroupRoot: ({ size, max }) => ({
    maxWidth: getResponsiveMaxWidth(false, { size, max }),
    [theme.breakpoints.down('sm')]: {
      maxWidth: getResponsiveMaxWidth(true, { size, max }),
    },
  }),
}));

// COMPONENTS
const AvatarGroupMembers = ({ members, max, size, ...rest }) => {
  const avatarGroupClasses = useStyles({ max, size });
  const avatarClasses = useAvatarStyles({ size });
  return (
    <AvatarGroup
      classes={{ avatar: avatarClasses.avatarRoot, root: avatarGroupClasses.avatarGroupRoot }}
      max={max}
      {...rest}
    >
      {members.map(({ displayName, avatarUrl }) => (
        <AvatarUser key={displayName} displayName={displayName} avatarUrl={avatarUrl} size={size} />
      ))}
    </AvatarGroup>
  );
};

AvatarGroupMembers.propTypes = {
  members: PropTypes.arrayOf(PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string,
  })).isRequired,
  max: PropTypes.number,
  size: PropTypes.oneOf(SIZES),
};

AvatarGroupMembers.defaultProps = {
  max: 3,
  size: MEDIUM,
};

export default AvatarGroupMembers;
