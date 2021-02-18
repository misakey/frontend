import React, { useMemo } from 'react';

import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';
import isString from '@misakey/helpers/isString';

import IconStack from '@misakey/ui/Icon/Stack';
import Avatar from '@misakey/ui/Avatar';
import { SIZES, MEDIUM } from '@misakey/ui/constants/sizes';

import VpnKeyIcon from '@material-ui/icons/VpnKeyRounded';
import ClearIcon from '@material-ui/icons/ClearRounded';

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.grey[400],
    color: theme.palette.background.paper,
    fontWeight: theme.typography.fontWeightBold,
  },
}));

// COMPONENTS
function AvatarBox({ src, title, lostKey, size, ...rest }) {
  const internalClasses = useStyles();

  // convert size values to fontSize values,
  // see https://material-ui.com/api/icon/#props
  const fontSize = useMemo(
    () => (size === MEDIUM ? 'default' : size),
    [size],
  );

  const content = useMemo(
    () => {
      if (lostKey) {
        return (
          <IconStack
            fontSize={fontSize}
            color="textPrimary"
            ForegroundIcon={VpnKeyIcon}
            BackgroundIcon={ClearIcon}
          />
        );
      }
      if (isString(title)) {
        return title.slice(0, 3);
      }
      return '';
    },
    [lostKey, title, fontSize],
  );

  return (
    <Avatar
      alt={title}
      src={src}
      size={size}
      classes={{ root: internalClasses.root }}
      {...rest}
    >
      {content}
    </Avatar>
  );
}

AvatarBox.propTypes = {
  src: PropTypes.string,
  title: PropTypes.string,
  lostKey: PropTypes.bool,
  size: PropTypes.oneOf(SIZES),
};

AvatarBox.defaultProps = {
  src: undefined,
  title: null,
  lostKey: false,
  size: MEDIUM,
};

export default AvatarBox;
