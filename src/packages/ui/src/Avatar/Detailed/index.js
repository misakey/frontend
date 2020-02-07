import React from 'react';
import PropTypes from 'prop-types';

import { AVATAR_SIZE } from 'constants/ui/sizes';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import AvatarColorized from '../Colorized';

// CONSTANTS

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    [theme.breakpoints.up('sm')]: {
      margin: theme.spacing(6, 0),
    },
  },
  avatar: {
    width: `calc(2 * ${AVATAR_SIZE}px)`,
    height: `calc(2 * ${AVATAR_SIZE}px)`,
    fontSize: theme.typography.h3.fontSize,
    margin: theme.spacing(2, 0),
  },
  title: {
    flexGrow: 1,
    fontWeight: 'bold',
  },
}));

const AvatarDetailed = ({ text, image, title, subtitle }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AvatarColorized
        className={classes.avatar}
        text={text}
        image={image}
      />
      <Typography variant="h6" className={classes.title}>
        {title}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {subtitle}
      </Typography>
    </div>

  );
};

AvatarDetailed.propTypes = {
  image: PropTypes.string,
  subtitle: PropTypes.string,
  text: PropTypes.string,
  title: PropTypes.string,
};

AvatarDetailed.defaultProps = {
  text: '',
  image: '',
  title: '',
  subtitle: '',
};

export default AvatarDetailed;
