import React, { useMemo, useCallback } from 'react';

import PropTypes from 'prop-types';

import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';
import pick from '@misakey/helpers/pick';
import emailToDisplayName from '@misakey/helpers/emailToDisplayName';

import useSafeDestr from '@misakey/hooks/useSafeDestr';

// HELPERS
const pickUserProps = pick(['avatarUrl', 'displayName']);

// COMPONENTS
const ListItemUserMember = ({
  component: Component,
  skeleton: Skeleton,
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
    return <Skeleton />;
  }

  return (
    <Component
      {...rest}
      {...userProps}
      onRemove={handleRemove}
      isMember={isMember}
      identifier={identifier}
    />
  );
};

ListItemUserMember.propTypes = {
  component: PropTypes.elementType.isRequired,
  skeleton: PropTypes.elementType.isRequired,
  identifier: PropTypes.string,
  members: PropTypes.arrayOf(PropTypes.shape({
    identifierValue: PropTypes.string.isRequired,
  })),
  onRemove: PropTypes.func,
};

ListItemUserMember.defaultProps = {
  identifier: '',
  members: null,
  onRemove: null,
};

export default ListItemUserMember;
