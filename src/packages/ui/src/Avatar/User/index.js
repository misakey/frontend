import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { AVATAR_SIZE, AVATAR_SM_SIZE } from '@misakey/ui/constants/sizes';

import isAnyNotEmpty from '@misakey/helpers/isAnyNotEmpty';

import makeStyles from '@material-ui/core/styles/makeStyles';

import AvatarColorized from '@misakey/ui/Avatar/Colorized';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

// HOOKS
const useStyles = makeStyles((theme) => ({
  iconRoot: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    [theme.breakpoints.down('sm')]: {
      height: AVATAR_SM_SIZE,
      width: AVATAR_SM_SIZE,
    },
  },
}));

// COMPONENTS
const AvatarUser = ({
  identifier,
  displayName,
  avatarUrl,
  ...rest
}) => {
  const classes = useStyles();

  const isNotEmptyUser = useMemo(
    () => isAnyNotEmpty([identifier, displayName, avatarUrl]),
    [identifier, displayName, avatarUrl],
  );

  if (isNotEmptyUser) {
    return (
      <AvatarColorized
        className={classes.iconRoot}
        text={displayName || identifier}
        image={avatarUrl}
        {...rest}
      />
    );
  }

  return <AccountCircleIcon classes={{ root: classes.iconRoot }} color="disabled" {...rest} />;
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
