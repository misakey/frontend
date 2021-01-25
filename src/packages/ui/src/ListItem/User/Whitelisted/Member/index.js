import React, { useMemo, useCallback } from 'react';

import PropTypes from 'prop-types';

import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';
import pick from '@misakey/helpers/pick';
import emailToDisplayName from '@misakey/helpers/emailToDisplayName';

import useSafeDestr from '@misakey/hooks/useSafeDestr';

import ListItemUserWhitelisted from '@misakey/ui/ListItem/User/Whitelisted';
import ListItemUserWhitelistedSkeleton from '@misakey/ui/ListItem/User/Whitelisted/Skeleton';

// HELPERS
const pickUserProps = pick(['avatarUrl', 'displayName']);

// COMPONENTS
const ListItemUserWhitelistedMember = ({
  identifier, members, onRemove,
  ...rest }) => {
  const member = useMemo(
    () => (members || []).find(({ identifierValue }) => identifierValue === identifier),
    [members, identifier],
  );

  const isMember = useMemo(
    () => !isNil(member),
    [member],
  );

  const { id: memberId } = useSafeDestr(member);

  const userProps = useMemo(
    () => (isMember
      ? pickUserProps(member)
      : { displayName: emailToDisplayName(identifier) }),
    [isMember, member, identifier],
  );

  const onRemoveMember = useCallback(
    (event, referrerId) => (isNil(memberId)
      ? onRemove(event, referrerId)
      : onRemove(event, referrerId, memberId)),
    [onRemove, memberId],
  );

  const handleRemove = useMemo(
    () => (isFunction(onRemove) ? onRemoveMember : undefined),
    [onRemove, onRemoveMember],
  );

  if (isNil(members)) {
    return <ListItemUserWhitelistedSkeleton />;
  }

  return (
    <ListItemUserWhitelisted
      {...rest}
      {...userProps}
      onRemove={handleRemove}
      isMember={isMember}
      identifier={identifier}
    />
  );
};

ListItemUserWhitelistedMember.propTypes = {
  identifier: PropTypes.string,
  members: PropTypes.arrayOf(PropTypes.shape({
    identifierValue: PropTypes.string.isRequired,
  })),
  onRemove: PropTypes.func,
};

ListItemUserWhitelistedMember.defaultProps = {
  identifier: '',
  members: null,
  onRemove: null,
};

export default ListItemUserWhitelistedMember;
