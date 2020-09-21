import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { AVATAR_SIZE } from '@misakey/ui/constants/sizes';

import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';

import AvatarColorized from '@misakey/ui/Avatar/Colorized';

// CONSTANTS
export const RADIUS = 2 * AVATAR_SIZE;

// HOOKS
export const useLayoutStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: theme.spacing(1, 0),
    [theme.breakpoints.up('sm')]: {
      margin: theme.spacing(4, 0),
    },
  },
  avatar: {
    margin: theme.spacing(2, 0),
  },
}));

const useStyles = makeStyles((theme) => ({
  avatar: {
    width: RADIUS,
    height: RADIUS,
    fontSize: theme.typography.h3.fontSize,
  },
  title: {
    flexGrow: 1,
    fontWeight: 'bold',
  },
}));

// COMPONENTS
const AvatarDetailed = ({ text, image, title, subtitle, classes }) => {
  const internalClasses = useStyles();
  const layoutClasses = useLayoutStyles();

  return (
    <div className={clsx(layoutClasses.root, classes.root)}>
      <AvatarColorized
        className={clsx(internalClasses.avatar, layoutClasses.avatar)}
        text={text}
        image={image}
      />
      <Typography variant="h6" className={internalClasses.title} color="textPrimary" align="center">
        {title}
      </Typography>
      <Typography variant="body2" color="textSecondary" align="center">
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
  classes: PropTypes.object,
};

AvatarDetailed.defaultProps = {
  text: '',
  image: '',
  title: '',
  subtitle: '',
  classes: {},
};

export default AvatarDetailed;
