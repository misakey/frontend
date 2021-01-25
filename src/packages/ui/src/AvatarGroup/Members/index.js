import React from 'react';
import PropTypes from 'prop-types';

import AvatarGroup from '@material-ui/lab/AvatarGroup';
import AvatarUser from '@misakey/ui/Avatar/User';

// COMPONENTS
const AvatarGroupMembers = ({ members, max, ...rest }) => (
  <AvatarGroup
    max={max}
    {...rest}
  >
    {members.map(({ displayName, avatarUrl }) => (
      <AvatarUser key={displayName} displayName={displayName} avatarUrl={avatarUrl} />
    ))}
  </AvatarGroup>
);

AvatarGroupMembers.propTypes = {
  members: PropTypes.arrayOf(PropTypes.shape({
    displayName: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string,
  })).isRequired,
  max: PropTypes.number,
};

AvatarGroupMembers.defaultProps = {
  max: 3,
};

export default AvatarGroupMembers;
