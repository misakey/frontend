import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import AvatarUser from '@misakey/ui/Avatar/User';
import withUser from 'components/smart/withUser';
import omit from '@misakey/helpers/omit';

const WITH_USER_PROPS = ['isFetching', 'id', 'token', 'userId'];

const UserAvatar = ({ profile, ...props }) => {
  const { displayName, avatarUrl } = useMemo(() => profile || {}, [profile]);
  return (
    <AvatarUser displayName={displayName} avatarUrl={avatarUrl} {...omit(props, WITH_USER_PROPS)} />
  );
};


UserAvatar.propTypes = {
  isFetching: PropTypes.bool,
  profile: PropTypes.shape({
    displayName: PropTypes.string,
    avatarUrl: PropTypes.string,
  }),
};

UserAvatar.defaultProps = {
  isFetching: false,
  profile: {},
};

export default withUser(UserAvatar);
