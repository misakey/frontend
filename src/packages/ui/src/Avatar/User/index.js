import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import isAnyNotEmpty from '@misakey/helpers/isAnyNotEmpty';

import AvatarColorized from '@misakey/ui/Avatar/Colorized';
import Avatar from '@misakey/ui/Avatar';
import PersonIcon from '@material-ui/icons/Person';

// COMPONENTS
const AvatarUser = ({
  identifier,
  displayName,
  avatarUrl,
  ...rest
}) => {
  const isNotEmptyUser = useMemo(
    () => isAnyNotEmpty([identifier, displayName, avatarUrl]),
    [identifier, displayName, avatarUrl],
  );

  if (isNotEmptyUser) {
    return (
      <AvatarColorized
        text={displayName || identifier}
        image={avatarUrl}
        {...rest}
      />
    );
  }

  return (
    <Avatar>
      <PersonIcon {...rest} />
    </Avatar>
  );
};


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
