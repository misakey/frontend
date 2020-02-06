import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { AVATAR_SIZE } from 'constants/ui/sizes';

import any from '@misakey/helpers/any';
import complement from '@misakey/helpers/complement';
import isEmpty from '@misakey/helpers/isEmpty';

import makeStyles from '@material-ui/core/styles/makeStyles';

import AvatarColorized from '@misakey/ui/Avatar/Colorized';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

// HELPERS
const isNotEmptyUser = any(complement(isEmpty));

// HOOKS
const useStyles = makeStyles(() => ({
  iconRoot: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },
}));

// COMPONENTS
const AvatarUser = ({
  identifier,
  displayName,
  avatarUri,
  ...rest
}) => {
  const classes = useStyles();

  const isNotEmpty = useMemo(
    () => isNotEmptyUser([identifier, displayName, avatarUri]),
    [identifier, displayName, avatarUri],
  );

  if (isNotEmpty) {
    return <AvatarColorized text={displayName || identifier} image={avatarUri} {...rest} />;
  }

  return <AccountCircleIcon classes={{ root: classes.iconRoot }} color="disabled" {...rest} />;
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
