import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';

import AvatarColorized from '@misakey/ui/Avatar/Colorized';

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

const useStyles = makeStyles(() => ({
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
        classes={{ root: clsx(layoutClasses.avatar, classes.avatar) }}
        text={text}
        image={image}
        large
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
