import { useMemo } from 'react';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';
import isString from '@misakey/helpers/isString';

import IconStack from '@misakey/ui/Icon/Stack';
import Avatar from '@misakey/ui/Avatar';

import VpnKeyIcon from '@material-ui/icons/VpnKeyRounded';
import ClearIcon from '@material-ui/icons/ClearRounded';

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.grey[400],
    color: theme.palette.background.paper,
  },
}));

// COMPONENTS
function AvatarBox({ src, title, lostKey, large, ...rest }) {
  const internalClasses = useStyles();

  const content = useMemo(
    () => {
      if (lostKey) {
        return (
          <IconStack
            fontSize={large ? 'large' : 'default'}
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
    [lostKey, title, large],
  );

  return (
    <Avatar
      alt={title}
      src={src}
      large={large}
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
  large: PropTypes.bool,
};

AvatarBox.defaultProps = {
  src: undefined,
  title: null,
  lostKey: false,
  large: false,
};

export default AvatarBox;
