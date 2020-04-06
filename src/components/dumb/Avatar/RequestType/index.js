import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';

import PortabilityIcon from '@material-ui/icons/CloudUpload';
import ErasureIcon from '@material-ui/icons/Delete';

import propOr from '@misakey/helpers/propOr';

import REQUEST_TYPES, { ERASURE, PORTABILITY } from 'constants/databox/type';
import { Typography, Box } from '@material-ui/core';

const UnknownIcon = ({ isSmall }) => (
  <Box
    display="flex"
    flexGrow={1}
    alignItems="center"
    justifyContent="center"
  >
    <Typography variant={isSmall ? 'body1' : 'h5'}>?</Typography>
  </Box>
);

UnknownIcon.propTypes = {
  isSmall: PropTypes.bool,
};

UnknownIcon.defaultProps = {
  isSmall: false,
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatar: ({ type }) => ({
    backgroundColor: (propOr(theme.palette.grey, type)(theme.palette)).main,
    marginRight: theme.spacing(1),
  }),
  smallAvatar: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    border: `1px solid ${theme.palette.common.white}`,
  },
  smallIcon: {
    height: theme.spacing(2),
    width: theme.spacing(2),
  },
}));

const RequestTypeAvatar = ({ type, isSmall }) => {
  const classes = useStyles({ type });

  const typeIcon = useMemo(() => {
    if (type === ERASURE) {
      return <ErasureIcon className={clsx({ [classes.smallIcon]: isSmall })} />;
    }
    if (type === PORTABILITY) {
      return <PortabilityIcon className={clsx({ [classes.smallIcon]: isSmall })} />;
    }
    return <UnknownIcon isSmall={isSmall} />;
  }, [classes.smallIcon, isSmall, type]);

  return (
    <Avatar className={clsx(classes.avatar, { [classes.smallAvatar]: isSmall })}>
      {typeIcon}
    </Avatar>
  );
};

RequestTypeAvatar.propTypes = {
  type: PropTypes.oneOf(REQUEST_TYPES),
  isSmall: PropTypes.bool,
};

RequestTypeAvatar.defaultProps = {
  type: PORTABILITY,
  isSmall: false,
};

export default RequestTypeAvatar;
