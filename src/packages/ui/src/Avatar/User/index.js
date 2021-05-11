import React, { forwardRef, useMemo } from 'react';

import PropTypes from 'prop-types';

import isAnyNotEmpty from '@misakey/core/helpers/isAnyNotEmpty';

import AvatarColorized from '@misakey/ui/Avatar/Colorized';
import Avatar from '@misakey/ui/Avatar';
import PersonIcon from '@material-ui/icons/Person';

// COMPONENTS
const AvatarUser = forwardRef(({
  identifier,
  displayName,
  avatarUrl,
  ...rest
}, ref) => {
  const isNotEmptyUser = useMemo(
    () => isAnyNotEmpty([identifier, displayName, avatarUrl]),
    [identifier, displayName, avatarUrl],
  );

  if (isNotEmptyUser) {
    return (
      <AvatarColorized
        ref={ref}
        text={displayName || identifier}
        image={avatarUrl}
        {...rest}
      />
    );
  }

  return (
    <Avatar ref={ref} {...rest}>
      <PersonIcon />
    </Avatar>
  );
});


AvatarUser.propTypes = {
  identifier: PropTypes.string,
  displayName: PropTypes.string,
  avatarUrl: PropTypes.string,
};

AvatarUser.defaultProps = {
  identifier: '',
  displayName: '',
  avatarUrl: '',
};

export default AvatarUser;
