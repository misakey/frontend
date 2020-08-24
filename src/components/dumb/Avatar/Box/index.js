import React from 'react';
import PropTypes from 'prop-types';

import { AVATAR_SIZE, AVATAR_SM_SIZE } from '@misakey/ui/constants/sizes';

import Avatar from '@material-ui/core/Avatar';
import makeStyles from '@material-ui/core/styles/makeStyles';

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

function BoxAvatar({ children, src, title, ...rest }) {
  const classes = useStyles();

  return (

    <Avatar
      variant="circle"
      alt={title}
      src={src}
      className={classes.root}
      {...rest}
    >
      {title.slice(0, 3)}
    </Avatar>
  );
}

BoxAvatar.propTypes = {
  children: PropTypes.node,
  src: PropTypes.string,
  title: PropTypes.string.isRequired,
};

BoxAvatar.defaultProps = {
  children: undefined,
  src: undefined,
};

export default BoxAvatar;
