import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import { AVATAR_SIZE, AVATAR_SM_SIZE } from '@misakey/ui/constants/sizes';

import Avatar from '@material-ui/core/Avatar';
import makeStyles from '@material-ui/core/styles/makeStyles';
import isString from '@misakey/helpers/isString';

import IconStack from '@misakey/ui/Icon/Stack';

import VpnKeyIcon from '@material-ui/icons/VpnKeyRounded';
import ClearIcon from '@material-ui/icons/ClearRounded';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.grey[400],
    color: theme.palette.background.paper,
    textTransform: 'uppercase',
    textDecoration: 'none',
    fontSize: theme.spacing(1.5),
    height: AVATAR_SIZE,
    width: AVATAR_SIZE,
    [theme.breakpoints.down('sm')]: {
      height: AVATAR_SM_SIZE,
      width: AVATAR_SM_SIZE,
    },
  },
}));

function BoxAvatar({ children, src, title, lostKey, ...rest }) {
  const classes = useStyles();

  const content = useMemo(
    () => {
      if (lostKey) {
        return (
          <IconStack
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
    [lostKey, title],
  );

  return (

    <Avatar
      variant="circle"
      alt={title}
      src={src}
      className={classes.root}
      {...rest}
    >
      {content}
    </Avatar>
  );
}

BoxAvatar.propTypes = {
  children: PropTypes.node,
  src: PropTypes.string,
  title: PropTypes.string,
  lostKey: PropTypes.bool,
};

BoxAvatar.defaultProps = {
  children: undefined,
  title: null,
  lostKey: false,
  src: undefined,
};

export default BoxAvatar;
