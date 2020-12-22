import useIdentity from 'hooks/useIdentity';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import AvatarUser from '@misakey/ui/Avatar/User';
import AvatarUserSkeleton from '@misakey/ui/Avatar/User/Skeleton';

// COMPONENTS
const AvatarCurrentUser = (props) => {
  const { identity, isFetching } = useIdentity();
  const { displayName, avatarUrl } = useSafeDestr(identity);

  if (isFetching) {
    return (
      <AvatarUserSkeleton />
    );
  }

  return (
    <AvatarUser displayName={displayName} avatarUrl={avatarUrl} {...props} />
  );
};

export default AvatarCurrentUser;
