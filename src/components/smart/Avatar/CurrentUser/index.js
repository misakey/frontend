import { useMemo } from 'react';
import PropTypes from 'prop-types';

import IdentitySchema from 'store/schemas/Identity';

import AvatarUser from '@misakey/ui/Avatar/User';
import AvatarUserSkeleton from '@misakey/ui/Avatar/User/Skeleton';
import withIdentity from 'components/smart/withIdentity';
import omit from '@misakey/helpers/omit';

const WITH_USER_PROPS = ['id', 'identityId'];

const UserAvatar = ({ identity, isFetchingIdentity, ...props }) => {
  const { displayName, avatarUrl } = useMemo(() => identity || {}, [identity]);

  if (isFetchingIdentity) {
    return (
      <AvatarUserSkeleton />
    );
  }

  return (
    <AvatarUser displayName={displayName} avatarUrl={avatarUrl} {...omit(props, WITH_USER_PROPS)} />
  );
};


UserAvatar.propTypes = {
  // withIdentity
  identity: PropTypes.shape(IdentitySchema.propTypes),
  isFetchingIdentity: PropTypes.bool,
};

UserAvatar.defaultProps = {
  identity: null,
  isFetchingIdentity: false,
};

export default withIdentity(UserAvatar);
