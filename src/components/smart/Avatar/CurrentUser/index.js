import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import IdentitySchema from 'store/schemas/Identity';

import AvatarUser from '@misakey/ui/Avatar/User';
import withIdentity from 'components/smart/withIdentity';
import omit from '@misakey/helpers/omit';

const WITH_USER_PROPS = ['isFetchingIdentity', 'id', 'token', 'identityId'];

const UserAvatar = ({ identity, ...props }) => {
  const { displayName, avatarUrl } = useMemo(() => identity || {}, [identity]);
  return (
    <AvatarUser displayName={displayName} avatarUrl={avatarUrl} {...omit(props, WITH_USER_PROPS)} />
  );
};


UserAvatar.propTypes = {
  isFetching: PropTypes.bool,
  identity: PropTypes.shape(IdentitySchema.propTypes),
};

UserAvatar.defaultProps = {
  isFetching: false,
  identity: null,
};

export default withIdentity(UserAvatar);
