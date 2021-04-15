import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import makeStyles from '@material-ui/core/styles/makeStyles';
import Title from '@misakey/ui/Typography/Title';
import Subtitle from '@misakey/ui/Typography/Subtitle';

import AvatarColorized from '@misakey/ui/Avatar/Colorized';
import { LARGE } from '@misakey/ui/constants/sizes';

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
  wrapTextAnywhere: {
    overflowWrap: 'anywhere',
  },
}));

// COMPONENTS
const AvatarDetailed = ({ text, image, title, subtitle, classes }) => {
  const layoutClasses = useLayoutStyles();

  return (
    <div className={clsx(layoutClasses.root, classes.root)}>
      <AvatarColorized
        classes={{ root: clsx(layoutClasses.avatar, classes.avatar) }}
        text={text}
        image={image}
        size={LARGE}
      />
      <Title classes={{ root: classes.wrapTextAnywhere }} gutterBottom={false} align="center">
        {title}
      </Title>
      <Subtitle classes={{ root: classes.wrapTextAnywhere }} gutterBottom={false} align="center">
        {subtitle}
      </Subtitle>
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
