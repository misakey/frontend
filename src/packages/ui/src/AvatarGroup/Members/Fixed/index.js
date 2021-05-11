import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import {
  SMALL, MEDIUM, LARGE, SIZES,
  AVATAR_SIZE, AVATAR_SM_SIZE,
  LARGE_AVATAR_SIZE, LARGE_AVATAR_SM_SIZE,
  SMALL_AVATAR_SIZE, SMALL_AVATAR_SM_SIZE,
} from '@misakey/ui/constants/sizes';

import makeStyles from '@material-ui/core/styles/makeStyles';

import AvatarGroupMembers, { getResponsiveMaxWidth } from '@misakey/ui/AvatarGroup/Members';

// HELPERS
const getSpacingRatio = (count) => 0.75 + (0.25 * count);

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatarGroupRoot: ({ size }) => ({
    transform: 'rotate(-45deg)',
    maxWidth: getResponsiveMaxWidth(false, { size, max: 1 }),
    [theme.breakpoints.down('sm')]: {
      maxWidth: getResponsiveMaxWidth(true, { size, max: 1 }),
    },
  }),
  avatarRoot: ({ size, count }) => {
    if (size === LARGE) {
      return {
        transform: 'rotate(45deg)',
        height: `calc(${Math.round((LARGE_AVATAR_SIZE * getSpacingRatio(count)) / count)}px)`,
        width: `calc(${Math.round((LARGE_AVATAR_SIZE * getSpacingRatio(count)) / count)}px)`,
        [theme.breakpoints.down('sm')]: {
          height: `calc(${Math.round((LARGE_AVATAR_SM_SIZE * getSpacingRatio(count)) / count)}px)`,
          width: `calc(${Math.round((LARGE_AVATAR_SM_SIZE * getSpacingRatio(count)) / count)}px)`,
        },
      };
    }

    if (size === SMALL) {
      return {
        transform: 'rotate(45deg)',
        height: `calc(${Math.round((SMALL_AVATAR_SIZE * getSpacingRatio(count)) / count)}px)`,
        width: `calc(${Math.round((SMALL_AVATAR_SIZE * getSpacingRatio(count)) / count)}px)`,
        [theme.breakpoints.down('sm')]: {
          height: `calc(${Math.round((SMALL_AVATAR_SM_SIZE * getSpacingRatio(count)) / count)}px)`,
          width: `calc(${Math.round((SMALL_AVATAR_SM_SIZE * getSpacingRatio(count)) / count)}px)`,
        },
      };
    }

    return {
      transform: 'rotate(45deg)',
      height: `calc(${Math.round((AVATAR_SIZE * getSpacingRatio(count)) / count)}px)`,
      width: `calc(${Math.round((AVATAR_SIZE * getSpacingRatio(count)) / count)}px)`,
      [theme.breakpoints.down('sm')]: {
        height: `calc(${Math.round((AVATAR_SM_SIZE * getSpacingRatio(count)) / count)}px)`,
        width: `calc(${Math.round((AVATAR_SM_SIZE * getSpacingRatio(count)) / count)}px)`,
      },
    };
  },
}));

// COMPONENTS
const AvatarGroupMembersFixed = ({ size, max, members, ...props }) => {
  const count = useMemo(
    () => Math.min(max, Math.max(1, (members || []).length)),
    [members, max],
  );
  const classes = useStyles({ size, count });

  return (
    <AvatarGroupMembers
      classes={{ avatar: classes.avatarRoot, root: classes.avatarGroupRoot }}
      size={size}
      members={members}
      {...props}
    />
  );
};

AvatarGroupMembersFixed.propTypes = {
  max: PropTypes.number,
  size: PropTypes.oneOf(SIZES),
  members: PropTypes.arrayOf(PropTypes.object).isRequired,
};

AvatarGroupMembersFixed.defaultProps = {
  max: 3,
  size: MEDIUM,
};

export default AvatarGroupMembersFixed;
