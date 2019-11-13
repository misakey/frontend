import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import ColorizedAvatar from '../Colorized';

// CONSTANTS

// HOOKS
const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '3rem 0',
  },
  avatar: {
    width: '100px',
    height: '100px',
    fontSize: '3.25rem',
    margin: '1rem 0',
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
      <ColorizedAvatar
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
