import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';

import UserSchema from '@misakey/react/auth/store/schemas/User';
import { selectors as orgSelectors } from 'store/reducers/identity/organizations';
import { MAX_MEMBERS } from '@misakey/ui/constants/avatars';
import { MEDIUM, SIZES } from '@misakey/ui/constants/sizes';

import isSelfOrg from 'helpers/isSelfOrg';
import isEmpty from '@misakey/core/helpers/isEmpty';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { useSelector } from 'react-redux';

import AvatarSkeleton from '@misakey/ui/Avatar/Skeleton';
import AvatarColorized, { BACKGROUND_COLOR } from '@misakey/ui/Avatar/Colorized';
import IconStackLostKey from '@misakey/ui/Icon/Stack/LostKey';
import AvatarGroupMembersFixed from '@misakey/ui/AvatarGroup/Members/Fixed';
import AvatarClient from '@misakey/ui/Avatar/Client';

// CONSTANTS
const { makeDenormalizeOrganization } = orgSelectors;

const TEXT_LENGTH = 3;

// COMPONENTS
const AvatarBox = forwardRef(({
  ownerOrgId, identityId, members,
  title, lostKey, isFetching, size, ...props
}, ref) => {
  const getOrganizationSelector = useMemo(
    () => makeDenormalizeOrganization(),
    [],
  );
  // convert size values to fontSize values,
  // see https://material-ui.com/api/icon/#props
  const fontSize = useMemo(
    () => (size === MEDIUM ? 'default' : size),
    [size],
  );

  const isSelfOrgBox = useMemo(
    () => isSelfOrg(ownerOrgId),
    [ownerOrgId],
  );

  const organization = useSelector((state) => getOrganizationSelector(state, ownerOrgId));
  const { logoUrl, name } = useSafeDestr(organization);

  const membersWithoutSelf = useMemo(
    () => (members || []).filter(({ id: memberId }) => memberId !== identityId),
    [identityId, members],
  );

  const isTheOnlyMember = useMemo(
    () => !isEmpty(members) && isEmpty(membersWithoutSelf),
    [members, membersWithoutSelf],
  );

  if (isFetching) {
    return (
      <AvatarSkeleton ref={ref} />
    );
  }

  if (lostKey) {
    return (
      <AvatarColorized
        ref={ref}
        text={title}
        textLength={TEXT_LENGTH}
        size={size}
        colorizedProp={BACKGROUND_COLOR}
        {...props}
      >
        <IconStackLostKey
          fontSize={fontSize}
          color="textPrimary"
        />
      </AvatarColorized>
    );
  }

  if (isSelfOrgBox) {
    if (isTheOnlyMember) {
      return (
        <AvatarColorized
          ref={ref}
          text={title}
          textLength={TEXT_LENGTH}
          size={size}
          colorizedProp={BACKGROUND_COLOR}
          {...props}
        />
      );
    }

    return (
      <AvatarGroupMembersFixed
        ref={ref}
        max={MAX_MEMBERS}
        members={membersWithoutSelf}
        size={size}
        {...props}
      />
    );
  }
  return (
    <AvatarClient
      ref={ref}
      name={name}
      src={logoUrl}
      size={size}
      {...props}
    />
  );
});

AvatarBox.propTypes = {
  title: PropTypes.string.isRequired,
  ownerOrgId: PropTypes.string.isRequired,
  members: PropTypes.arrayOf(PropTypes.shape(UserSchema.propTypes)),
  identityId: PropTypes.string,
  lostKey: PropTypes.bool,
  isFetching: PropTypes.bool,
  size: PropTypes.oneOf(SIZES),
};

AvatarBox.defaultProps = {
  identityId: null,
  lostKey: false,
  isFetching: false,
  size: MEDIUM,
  members: [],
};

export default AvatarBox;
