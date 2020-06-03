import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import AvatarUser from '@misakey/ui/Avatar/User';
import withUser from 'components/smart/withUser';

const UserAvatar = ({ profile, ...props }) => {
  const { displayName, avatarUri } = useMemo(() => profile || {}, [profile]);
  return <AvatarUser displayName={displayName} avatarUri={avatarUri} {...props} />;
};


UserAvatar.propTypes = {
  t: PropTypes.func.isRequired,
  isFetching: PropTypes.bool,
  profile: PropTypes.shape({
    displayName: PropTypes.string,
    avatarUri: PropTypes.string,
  }),
};

UserAvatar.defaultProps = {
  isFetching: false,
  profile: {},
};

export default withUser(UserAvatar);
