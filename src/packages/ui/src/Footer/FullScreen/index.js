import React from 'react';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Container from '@material-ui/core/Container';
import Footer from '@misakey/ui/Footer';

// CONSTANTS
const CONTAINER_PROPS = {
  maxWidth: false,
};

// HOOKS
const useStyles = makeStyles(() => ({
  footer: {
    borderLeft: 'none',
    borderRight: 'none',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
}));

// COMPONENTS
const FooterFullScreen = (props) => {
  const classes = useStyles();

  return (
    <Footer
      className={classes.footer}
      ContainerComponent={Container}
      containerProps={CONTAINER_PROPS}
      square
      {...props}
    />
  );
};

export default FooterFullScreen;
