import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import any from '@misakey/helpers/any';
import complement from '@misakey/helpers/complement';
import isEmpty from '@misakey/helpers/isEmpty';

import AvatarColorized from 'components/dumb/Avatar/Colorized';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

// HELPERS
const isNotEmptyUser = any(complement(isEmpty));

// COMPONENTS
const AvatarUser = ({
  identifier,
  displayName,
  avatarUri,
  ...rest
}) => {
  const isNotEmpty = useMemo(
    () => isNotEmptyUser([identifier, displayName, avatarUri]),
    [identifier, displayName, avatarUri],
  );

  if (isNotEmpty) {
    return <AvatarColorized text={displayName || identifier} image={avatarUri} {...rest} />;
  }

  return <AccountCircleIcon fontSize="large" color="disabled" {...rest} />;
};


AvatarUser.propTypes = {
  identifier: PropTypes.string,
  displayName: PropTypes.string,
  avatarUri: PropTypes.string,
};

AvatarUser.defaultProps = {
  identifier: '',
  displayName: '',
  avatarUri: '',
};

export default AvatarUser;
